import { NextResponse } from "next/server";
import os from "os";

export async function GET() {

  try {

    const cpus = os.cpus().length;
    const loadAverage = os.loadavg()[0] / cpus;
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      loadAverage,
      timestamp,
      cpuCount: cpus,
    });

  } catch (error) {
    
    console.error("Error getting CPU load:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve CPU load",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
