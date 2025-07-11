"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, RefreshCw, Clock, User } from "lucide-react"

interface LogEntry {
  BatchID: string
  ToolID: string
  ToolName: string
  TimeShift: string
  Manager: string
  Remark: string
  Timestamp: string
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchLogs = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/logs")
      const data = await response.json()

      if (data.success) {
        // Show only the last 20 entries
        setLogs(data.data.slice(-20).reverse())
      } else {
        setError(data.error || "Failed to fetch logs")
      }
    } catch (err) {
      setError("Error fetching logs")
    } finally {
      setLoading(false)
    }
  }

  const getShiftBadgeColor = (shift: string) => {
    switch (shift) {
      case "Morning":
        return "bg-yellow-100 text-yellow-800"
      case "Evening":
        return "bg-orange-100 text-orange-800"
      case "Night":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Log Entries
        </CardTitle>
        <CardDescription>View recent traceability queries logged to CSV file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={fetchLogs} disabled={loading} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Load Recent Logs"}
        </Button>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {logs.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Logged At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{log.BatchID}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.ToolName}</span>
                        <span className="text-sm text-gray-500">{log.ToolID}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getShiftBadgeColor(log.TimeShift)}>{log.TimeShift}</Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      {log.Manager}
                    </TableCell>
                    <TableCell className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {new Date(log.Timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {logs.length === 0 && !loading && !error && (
          <div className="text-center text-gray-500 py-4">
            No log entries found. Process some BatchIDs to see logs here.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
