import { NextRequest, NextResponse } from "next/server";
import { fixObjection } from "@/lib/fixer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { objection?: string };
    const objection = typeof body.objection === "string" ? body.objection.trim() : "";
    if (!objection || objection.length < 4) {
      return NextResponse.json(
        { ok: false, error: "اكتب نص اعتراض المراجعة أولًا" },
        { status: 400 },
      );
    }
    const result = fixObjection(objection);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("fix error", error);
    return NextResponse.json({ ok: false, error: "تعذرت المعالجة" }, { status: 500 });
  }
}
