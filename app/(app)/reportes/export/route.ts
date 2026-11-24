import type { NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import {
  parseReportDataset,
  parseReportRange,
} from "@/lib/report-utils";
import { getReportCsv } from "@/lib/reports";

export async function GET(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return new Response("No autorizado.", { status: 401 });
  }

  const dataset = parseReportDataset(
    request.nextUrl.searchParams.get("dataset"),
  );
  const range = parseReportRange(request.nextUrl.searchParams.get("rango"));

  try {
    const { filename, csv } = await getReportCsv(dataset, range);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("No se pudo generar el reporte.", { status: 500 });
  }
}
