import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface BatchData {
  BatchID: string
  ToolID: string
  TimeShift: string
  Timestamp: string
}

interface ToolData {
  ToolID: string
  ToolName: string
  TimeShift: string
  Manager: string
  Remark: string
}

interface TraceabilityResult {
  BatchID: string
  ToolID: string
  ToolName: string
  TimeShift: string
  Manager: string
  Remark: string
  Timestamp: string
}

function parseCSV(content: string): any[] {
  const lines = content.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ""
    })
    return obj
  })
}

function arrayToCSV(data: any[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const csvContent = [headers.join(","), ...data.map((row) => headers.map((header) => row[header]).join(","))].join(
    "\n",
  )

  return csvContent
}

export async function POST(request: NextRequest) {
  try {
    const { batchId } = await request.json()

    if (!batchId || batchId.length !== 8) {
      return NextResponse.json({
        success: false,
        error: "Invalid BatchID. Must be 8 digits.",
      })
    }

    // Read batch dataset
    const batchDataPath = path.join(process.cwd(), "data", "batch_dataset.csv")
    const batchContent = fs.readFileSync(batchDataPath, "utf-8")
    const batchData: BatchData[] = parseCSV(batchContent)

    // Read tools dataset
    const toolsDataPath = path.join(process.cwd(), "data", "tools_dataset.csv")
    const toolsContent = fs.readFileSync(toolsDataPath, "utf-8")
    const toolsData: ToolData[] = parseCSV(toolsContent)

    // Filter batch data for the given BatchID
    const batchRecords = batchData.filter((record) => record.BatchID === batchId)

    if (batchRecords.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No records found for BatchID: ${batchId}`,
      })
    }

    // Join with tools data
    const results: TraceabilityResult[] = batchRecords.map((batchRecord) => {
      const toolRecord = toolsData.find(
        (tool) => tool.ToolID === batchRecord.ToolID && tool.TimeShift === batchRecord.TimeShift,
      )

      return {
        BatchID: batchRecord.BatchID,
        ToolID: batchRecord.ToolID,
        ToolName: toolRecord?.ToolName || "Unknown",
        TimeShift: batchRecord.TimeShift,
        Manager: toolRecord?.Manager || "Unknown",
        Remark: toolRecord?.Remark || "No remarks",
        Timestamp: new Date().toISOString(),
      }
    })

    // Append to log file
    const logPath = path.join(process.cwd(), "data", "traceability_log.csv")

    try {
      let logContent = ""
      const logExists = fs.existsSync(logPath)

      if (logExists) {
        logContent = fs.readFileSync(logPath, "utf-8")
      } else {
        // Create header if file doesn't exist
        logContent = "BatchID,ToolID,ToolName,TimeShift,Manager,Remark,Timestamp\n"
      }

      // Prepare new log entries with proper CSV formatting
      const newLogEntries = results
        .map((result) => {
          // Escape commas and quotes in CSV fields
          const escapeCSVField = (field: string) => {
            if (field.includes(",") || field.includes('"') || field.includes("\n")) {
              return `"${field.replace(/"/g, '""')}"`
            }
            return field
          }

          return [
            escapeCSVField(result.BatchID),
            escapeCSVField(result.ToolID),
            escapeCSVField(result.ToolName),
            escapeCSVField(result.TimeShift),
            escapeCSVField(result.Manager),
            escapeCSVField(result.Remark),
            escapeCSVField(new Date().toLocaleString()),
          ].join(",")
        })
        .join("\n")

      // Append new entries to log file
      const finalLogContent = logExists ? logContent + newLogEntries + "\n" : logContent + newLogEntries + "\n"

      fs.writeFileSync(logPath, finalLogContent)

      console.log(`Successfully logged ${results.length} entries to traceability_log.csv for BatchID: ${batchId}`)
    } catch (logError) {
      console.error("Error writing to log file:", logError)
      // Continue execution even if logging fails
    }

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error("Traceability API error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    })
  }
}
