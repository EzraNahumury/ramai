import { NextResponse } from "next/server";
import { getEvent } from "@/lib/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const event = await getEvent(Number(id));
    return NextResponse.json({ event, configured: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load event" },
      { status: 500 }
    );
  }
}
