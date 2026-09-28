import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { db, ingredientStaffTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireIngredientStaff(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = getAuth(req)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }

  const [grant] = await db
    .select()
    .from(ingredientStaffTable)
    .where(eq(ingredientStaffTable.userId, userId))
    .limit(1);

  if (!grant) {
    res.status(403).json({ error: "Ingredient staff access required" });
    return;
  }

  res.locals.ingredientStaff = grant;
  next();
}