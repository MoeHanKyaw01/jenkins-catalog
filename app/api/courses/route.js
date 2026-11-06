import { NextResponse, connection } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  await connection(); // always read fresh data, never prerender at build time
  const [rows] = await pool.query("SELECT * FROM courses ORDER BY id");
  return NextResponse.json(rows);
}