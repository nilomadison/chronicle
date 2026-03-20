import { NextResponse } from "next/server";
import { processJobs } from "@/lib/jobs/processor";

export async function POST() {
  try {
    const results = await processJobs(10);
    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error("Job processing error:", error);
    return NextResponse.json(
      { error: "Job processing failed" },
      { status: 500 }
    );
  }
}
