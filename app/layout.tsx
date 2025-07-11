import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Product Traceability System",
  description: "Quality Control Automation & Batch Tracking System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/html5-qrcode" type="text/javascript"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
