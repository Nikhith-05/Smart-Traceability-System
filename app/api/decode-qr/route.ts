import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import jsQR from "jsqr"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({
        success: false,
        error: "No image provided",
      })
    }

    // Convert image to buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer())

    // Process image with sharp to get raw pixel data
    const { data, info } = await sharp(imageBuffer).raw().ensureAlpha().toBuffer({ resolveWithObject: true })

    // Create ImageData-like object for jsQR
    const imageData = {
      data: new Uint8ClampedArray(data),
      width: info.width,
      height: info.height,
    }

    // Decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      return NextResponse.json({
        success: true,
        batchId: code.data,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "No QR code found in the image",
      })
    }
  } catch (error) {
    console.error("QR decode error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process image",
    })
  }
}
