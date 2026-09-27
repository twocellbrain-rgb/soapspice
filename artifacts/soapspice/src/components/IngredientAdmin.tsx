import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetIngredientStaff, getGetIngredientStaffQueryKey, useListAdminIngredients, getListAdminIngredientsQueryKey,
  createAdminIngredient, editAdminIngredient, approveAdminIngredient,
  getGetIngredientsQueryKey,
} from '@workspace/api-client-react';
import type { IngredientEdit } from '@workspace/api-client-react';
import { Link } from 'wouter';

const empty: IngredientEdit = {
  id: '', name: '', alternateNames: [], category: 'oil', description: '',
  naohSap: 0, kohSap: 0, sapSourceTitle: '', sapSourceUrl: '', sapProvenance: '', active: false,
};
const input = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm';

export default function IngredientAdmin() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const client = useQueryClient();
  const staff = useGetIngredientStaff({ query: { queryKey: getGetIngredientStaffQueryKey(), enabled: Boolean(isSignedIn), retry: false } });
  const catalog = useListAdminIngredients({ query: { queryKey: getListAdminIngredientsQueryKey(), enabled: Boolean(staff.data), staleTime: 0, refetchOnMount: 'always' } });
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState<IngredientEdit>(empty);
  const [viewedRevision, setViewedRevision] = useState<number | null>(null);
  const [aliases, setAliases] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const current = catalog.data?.find(row => row.id === selected);
  function load(row: NonNullable<typeof current>) {
    setForm({
      id: row.id, name: row.name, alternateNames: row.alternateNames,
      category: row.category, description: row.description, naohSap: row.naohSap,
      kohSap: row.kohSap, sapSourceTitle: row.sapSourceTitle,
      sapSourceUrl: row.sapSourceUrl, sapProvenance: row.sapProvenance, active: row.active,
    });
    setAliases(row.alternateNames.join(', '));
    setViewedRevision(row.revision);
  }
  useEffect(() => {
    const row = catalog.data?.find(item => item.id === selected);
    if (!row) return;
    load(row);
  }, [selected]); // Deliberately do not overwrite an in-progress form when a list refetches.
  function set<K extends keyof IngredientEdit>(key: K, value: IngredientEdit[K]) {
    setForm(old => ({ ...old, [key]: value }));
  }
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: getListAdminIngredientsQueryKey() }),
      client.invalidateQueries({ queryKey: getGetIngredientsQueryKey() }),
      client.invalidateQueries({ queryKey: ['/api/ingredients'] }),
    ]);
  }
  async function save() {
    setBusy(true); setMessage('');
    try {
      const payload = {
        ...form, id: form.id.trim(), name: form.name.trim(), description: form.description.trim(),
        alternateNames: aliases.split(',').map(name => name.trim()).filter(Boolean),
        sapSourceTitle: form.sapSourceTitle.trim(), sapSourceUrl: form.sapSourceUrl.trim(),
        sapProvenance: form.sapProvenance.trim(),
      };
      const row = selected ? await editAdminIngredient(selected, payload) : await createAdminIngredient(payload);
      await refresh();
      setSelected(row.id);
      load(row);
      setMessage(`Saved ${row.name} as ${row.verificationStatus === 'draft' ? 'draft' : 'source-linked, pending review'}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save ingredient.');
    } finally { setBusy(false); }
  }
  async function approve() {
    if (!selected || viewedRevision === null) return;
    setBusy(true); setMessage('');
    try {
      const row = await approveAdminIngredient(selected, { expectedRevision: viewedRevision });
      await refresh();
      load(row);
      setMessage('SAP value approved. Check the public catalog to confirm its label.');
    } catch (error) {
      const status = error && typeof error === 'object' && 'status' in error ? error.status : null;
      if (status === 409) {
        const fresh = await catalog.refetch();
        const row = fresh.data?.find(item => item.id === selected);
        if (row) load(row);
        setMessage('This ingredient changed while you were reviewing it. The latest values are shown; inspect them before trying again.');
      } else {
        setMessage(error instanceof Error ? error.message : 'Could not approve ingredient.');
      }
    } finally { setBusy(false); }
  }
  if (!isLoaded) return <main className="mx-auto max-w-5xl p-8">Checking your account…</main>;
  if (!isSignedIn) return <main className="mx-auto max-w-5xl p-8"><p>Sign in to access ingredient administration.</p><Link href="/sign-in" className="underline">Sign in</Link></main>;
  if (staff.isLoading) return <main className="mx-auto max-w-5xl p-8">Checking ingredient permissions…</main>;
  if (staff.isError) return <main className="mx-auto max-w-5xl p-8"><h1 className="text-2xl font-bold">Ingredient administration unavailable</h1><p>Your account needs an editor or reviewer grant, or the service could not be reached. Account ID for a database administrator: <code>{user?.id}</code></p><button className="underline" onClick={() => void staff.refetch()}>Try again</button></main>;
  return <main className="mx-auto max-w-6xl space-y-6 px-5 py-12 text-slate-800">
    <div><Link href="/ingredients" className="text-sm underline">← Public catalog</Link><h1 className="mt-4 text-4xl font-bold">Ingredient review</h1><p className="mt-2 text-sm">Your role: {staff.data?.role}. Saving any edit removes prior approval. Only a different reviewer can approve a cited, source-linked record.</p></div>
    {catalog.isError && <p role="alert">Could not load the staff catalog. <button className="underline" onClick={() => void catalog.refetch()}>Retry</button></p>}
    <div className="grid gap-8 md:grid-cols-[minmax(220px,1fr)_2fr]">
      <aside className="space-y-2">
        <button type="button" className="w-full rounded-xl border bg-white p-3 text-left font-bold" onClick={() => { setSelected(''); setForm(empty); setViewedRevision(null); setAliases(''); setMessage(''); }}>+ New draft</button>
        {catalog.data?.map(row => <button key={row.id} type="button" onClick={() => { setSelected(row.id); load(row); setMessage(''); }} className={`w-full rounded-xl border p-3 text-left ${selected === row.id ? 'border-teal-700 bg-teal-50' : 'bg-white'}`}><strong className="block">{row.name}</strong><span className="text-xs">{row.verificationStatus === 'administrator-verified' ? 'Approved' : row.verificationStatus === 'draft' ? 'Draft · private' : 'Source linked · pending review'}{!row.active && ' · inactive'}</span></button>)}
      </aside>
      <section className="space-y-4 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">{selected ? `Edit ${current?.name ?? selected}` : 'New ingredient draft'}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">ID (lowercase slug)<input className={input} value={form.id} disabled={Boolean(selected)} onChange={e => set('id', e.target.value)} /></label>
          <label className="text-sm font-bold">Name<input className={input} value={form.name} onChange={e => set('name', e.target.value)} /></label>
          <label className="text-sm font-bold">Category<select className={input} value={form.category} onChange={e => set('category', e.target.value as 'oil' | 'butter')}><option value="oil">Oil</option><option value="butter">Butter</option></select></label>
          <label className="text-sm font-bold">Aliases (comma separated)<input className={input} value={aliases} onChange={e => setAliases(e.target.value)} /></label>
          <label className="text-sm font-bold">NaOH SAP (g/g)<input type="number" step="any" className={input} value={form.naohSap} onChange={e => set('naohSap', Number(e.target.value))} /></label>
          <label className="text-sm font-bold">KOH SAP (g/g)<input type="number" step="any" className={input} value={form.kohSap} onChange={e => set('kohSap', Number(e.target.value))} /></label>
        </div>
        <label className="block text-sm font-bold">Description<textarea className={input} rows={3} value={form.description} onChange={e => set('description', e.target.value)} /></label>
        <p className="text-sm">Record both citation fields to make a draft source-linked. Provenance should explain how the source matches this exact oil or butter and processing grade, including where the numbers came from.</p>
        <label className="block text-sm font-bold">SAP source title<input className={input} value={form.sapSourceTitle} onChange={e => set('sapSourceTitle', e.target.value)} /></label>
        <label className="block text-sm font-bold">SAP source URL<input type="url" className={input} value={form.sapSourceUrl} onChange={e => set('sapSourceUrl', e.target.value)} /></label>
        <label className="block text-sm font-bold">Source provenance and matching notes<textarea className={input} rows={3} value={form.sapProvenance} onChange={e => set('sapProvenance', e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} /> Active (source-linked records become visible in the public catalog)</label>
        {current?.reviewedAt && <p className="text-sm">Reviewed {new Date(current.reviewedAt).toLocaleString()} by {current.reviewedBy}</p>}
        {message && <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
        <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => void save()} className="rounded-full bg-teal-800 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">Save draft or pending review</button>
        {staff.data?.role === 'reviewer' && current?.verificationStatus === 'source-linked-needs-review' && <button disabled={busy || viewedRevision === null || current.lastEditedBy === user?.id} onClick={() => void approve()} className="rounded-full border border-teal-800 px-5 py-2 text-sm font-bold text-teal-800 disabled:opacity-50">Approve cited values</button>}</div>
      </section>
    </div>
  </main>;
}