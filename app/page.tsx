"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Scan, AlertCircle, CheckCircle, Clock, User, Wrench } from "lucide-react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { LogViewer } from "@/components/log-viewer"

interface TraceabilityData {
  BatchID: string
  ToolID: string
  ToolName: string
  TimeShift: string
  Manager: string
  Remark: string
  Timestamp: string
}

export default function TraceabilitySystem() {
  const [scannerActive, setScannerActive] = useState(false)
  const [batchId, setBatchId] = useState("")
  const [traceabilityData, setTraceabilityData] = useState<TraceabilityData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [logConfirmation, setLogConfirmation] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [])

  const startScanner = () => {
    setScannerActive(true)
    setError("")

    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false)

    scannerRef.current = scanner

    scanner.render(
      (decodedText) => {
        setBatchId(decodedText)
        setSuccess(`QR Code scanned successfully: ${decodedText}`)
        stopScanner()
        processTraceability(decodedText)
      },
      (error) => {
        console.log("QR scan error:", error)
      },
    )
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setScannerActive(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch("/api/decode-qr", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setBatchId(data.batchId)
        setSuccess(`QR Code decoded from image: ${data.batchId}`)
        await processTraceability(data.batchId)
      } else {
        setError(data.error || "Failed to decode QR code from image")
      }
    } catch (err) {
      setError("Error processing image")
    } finally {
      setLoading(false)
    }
  }

  const processTraceability = async (batchIdToProcess: string) => {
    setLoading(true)
    setError("")
    setLogConfirmation("")

    try {
      const response = await fetch("/api/traceability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batchId: batchIdToProcess }),
      })

      const data = await response.json()

      if (data.success) {
        setTraceabilityData(data.data)
        setSuccess(`Traceability data retrieved for BatchID: ${batchIdToProcess}`)
        setLogConfirmation(`✅ Successfully logged ${data.data.length} entries to traceability_log.csv`)
      } else {
        setError(data.error || "Failed to retrieve traceability data")
        setTraceabilityData([])
      }
    } catch (err) {
      setError("Error retrieving traceability data")
      setTraceabilityData([])
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = () => {
    if (batchId.trim()) {
      processTraceability(batchId.trim())
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Smart Product Traceability System</h1>
          <p className="text-lg text-gray-600">Quality Control Automation & Batch Tracking</p>
        </div>

        {/* Input Methods */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Live QR Scanner
              </CardTitle>
              <CardDescription>Scan QR code using your camera</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!scannerActive ? (
                <Button onClick={startScanner} className="w-full">
                  <Scan className="h-4 w-4 mr-2" />
                  Start Scanner
                </Button>
              ) : (
                <Button onClick={stopScanner} variant="outline" className="w-full">
                  Stop Scanner
                </Button>
              )}
              <div id="qr-reader" className="w-full"></div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload QR Image
              </CardTitle>
              <CardDescription>Upload an image containing QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="cursor-pointer"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Manual Entry
              </CardTitle>
              <CardDescription>Enter BatchID manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batchId">BatchID (8 digits)</Label>
                <Input
                  id="batchId"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="e.g., 12345678"
                  maxLength={8}
                />
              </div>
              <Button onClick={handleManualSubmit} className="w-full" disabled={loading || !batchId.trim()}>
                Process BatchID
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {logConfirmation && (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">{logConfirmation}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              Processing...
            </div>
          </div>
        )}

        {/* Results Table */}
        {traceabilityData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Traceability Results for BatchID: {batchId}
              </CardTitle>
              <CardDescription>Production tools and quality control information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool ID</TableHead>
                      <TableHead>Tool Name</TableHead>
                      <TableHead>Time Shift</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Logged At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {traceabilityData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{item.ToolID}</TableCell>
                        <TableCell className="font-medium">{item.ToolName}</TableCell>
                        <TableCell>
                          <Badge className={getShiftBadgeColor(item.TimeShift)}>{item.TimeShift}</Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {item.Manager}
                        </TableCell>
                        <TableCell>{item.Remark}</TableCell>
                        <TableCell className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {new Date(item.Timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Log Viewer */}
        <LogViewer />

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          Smart Product Labeling and Traceability System - Quality Control Automation
        </div>
      </div>
    </div>
  )
}
