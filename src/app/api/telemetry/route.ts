import { NextResponse } from "next/server";
import { globalTelemetry } from "../../../telemetry";

export async function GET() {
  try {
    const stats = await globalTelemetry.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch telemetry" }, { status: 500 });
  }
}
