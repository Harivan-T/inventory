import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";

export async function GET() {
  const data = await db.select().from(items);
  return Response.json(data);
}