import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const logPath = path.join(process.cwd(), "data", "traceability_log.csv")

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No log file exists yet",
      })
    }

    const logContent = fs.readFileSync(logPath, "utf-8")
    const lines = logContent.trim().split("\n")

    if (lines.length <= 1) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Log file is empty",
      })
    }

    // Parse CSV content
    const headers = lines[0].split(",").map((h) => h.trim())
    const logEntries = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
      const entry: any = {}
      headers.forEach((header, index) => {
        entry[header] = values[index] || ""
      })
      return entry
    })

    return NextResponse.json({
      success: true,
      data: logEntries,
      totalEntries: logEntries.length,
    })
  } catch (error) {
    console.error("Error reading log file:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to read log file",
    })
  }
}
