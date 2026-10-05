import { and, eq } from "drizzle-orm";
import { amigoRecordsTable, db } from "@workspace/db";

export type AmigoData = Record<string, unknown>;

export async function getRecords<T extends AmigoData>(
  kind: string,
  ownerId: string,
): Promise<T[]> {
  const rows = await db
    .select()
    .from(amigoRecordsTable)
    .where(
      and(
        eq(amigoRecordsTable.kind, kind),
        eq(amigoRecordsTable.ownerId, ownerId),
      ),
    );
  return rows.map((row) => row.data as T);
}

export async function getAllRecords<T extends AmigoData>(
  kind: string,
): Promise<T[]> {
  const rows = await db
    .select()
    .from(amigoRecordsTable)
    .where(eq(amigoRecordsTable.kind, kind));
  return rows.map((row) => row.data as T);
}

export async function getRecord<T extends AmigoData>(
  id: string,
  ownerId: string,
): Promise<T | undefined> {
  const [row] = await db
    .select()
    .from(amigoRecordsTable)
    .where(
      and(
        eq(amigoRecordsTable.id, id),
        eq(amigoRecordsTable.ownerId, ownerId),
      ),
    )
    .limit(1);
  return row?.data as T | undefined;
}

export async function saveRecord(
  id: string,
  kind: string,
  ownerId: string | null,
  data: AmigoData,
): Promise<void> {
  await db
    .insert(amigoRecordsTable)
    .values({ id, kind, ownerId, data })
    .onConflictDoUpdate({
      target: amigoRecordsTable.id,
      set: { kind, ownerId, data, updatedAt: new Date() },
    });
}
