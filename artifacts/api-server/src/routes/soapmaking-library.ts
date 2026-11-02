import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { and, desc, eq } from "drizzle-orm";
import { db, soapmakingLibraryTable, type SoapmakingLibraryItem } from "@workspace/db";
import {
  DeleteSoapmakingLibraryItemParams,
  ListSoapmakingLibraryResponse,
  SaveSoapmakingLibraryItemBody,
  SaveSoapmakingLibraryItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
function output(row: SoapmakingLibraryItem) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}
function owner(req: Request): string | null {
  return getAuth(req)?.userId ?? null;
}
function requireUser(req: Request, res: Response, next: NextFunction): void {
  if (process.env.SOAPSPICE_PUBLIC_ONLY === "true") { res.status(404).json({ error: "Personal source libraries are disabled on this public site." }); return; }
  if (!owner(req)) { res.status(401).json({ error: "Sign in required" }); return; }
  next();
}
router.use("/soapmaking-library", requireUser);

router.get("/soapmaking-library", async (req, res): Promise<void> => {
  const rows = await db.select().from(soapmakingLibraryTable)
    .where(eq(soapmakingLibraryTable.ownerId, owner(req)!))
    .orderBy(desc(soapmakingLibraryTable.createdAt));
  res.json(ListSoapmakingLibraryResponse.parse(rows.map(output)));
});

router.post("/soapmaking-library", async (req, res): Promise<void> => {
  const parsed = SaveSoapmakingLibraryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid source details" }); return; }
  let url: URL;
  try { url = new URL(parsed.data.sourceUrl); } catch {
    res.status(400).json({ error: "Enter a valid source URL" }); return;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    res.status(400).json({ error: "Source URL must use HTTP or HTTPS" }); return;
  }
  const userId = owner(req)!;
  const [row] = await db.insert(soapmakingLibraryTable).values({
    ...parsed.data,
    ownerId: userId,
    author: parsed.data.author ?? null,
    summary: parsed.data.summary ?? null,
    notes: parsed.data.notes ?? null,
    tags: parsed.data.tags ?? [],
  }).onConflictDoNothing({
    target: [soapmakingLibraryTable.ownerId, soapmakingLibraryTable.sourceUrl],
  }).returning();
  if (!row) { res.status(409).json({ error: "This source is already in your library" }); return; }
  res.status(201).json(SaveSoapmakingLibraryItemResponse.parse(output(row)));
});

router.delete("/soapmaking-library/:articleId", async (req, res): Promise<void> => {
  const params = DeleteSoapmakingLibraryItemParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid source ID" }); return; }
  const [row] = await db.delete(soapmakingLibraryTable)
    .where(and(eq(soapmakingLibraryTable.id, params.data.articleId), eq(soapmakingLibraryTable.ownerId, owner(req)!)))
    .returning({ id: soapmakingLibraryTable.id });
  if (!row) { res.status(404).json({ error: "Source not found" }); return; }
  res.status(204).end();
});

export default router;
