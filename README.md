# Smart Product Traceability System

A modern web application for tracking manufacturing processes by linking batch IDs with production tools using QR code scanning, image upload, or manual entry.


## Overview

The Smart Product Traceability System enables quality control teams to track and monitor the production journey of manufactured items. By scanning or inputting batch IDs, users can instantly retrieve information about which tools were used in production, who managed those tools, and during which time shifts the production occurred.

## Features

- **Multiple Batch ID Input Methods**
  - Live QR code scanning via device camera
  - QR code recognition from uploaded images
  - Manual batch ID entry

- **Comprehensive Traceability**
  - Tool usage tracking by batch
  - Time shift information
  - Manager attribution
  - Quality remarks and notes

- **Data Management**
  - Automatic CSV logging
  - Log viewing and navigation
  - Production history tracking

## Technology Stack

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS, Radix UI components
- **QR Processing:** html5-qrcode, jsqr
- **Data Storage:** CSV-based file system

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Nikhith-08/Smart-Traceability-System.git
   cd smart-traceability-system
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create the log file (if it doesn't exist):
   ```powershell
   # PowerShell
   if (-not (Test-Path "data\traceability_log.csv")) {
       "BatchID,ToolID,ToolName,TimeShift,Manager,Remark,Timestamp" | Out-File -FilePath "data\traceability_log.csv"
   }
   ```
   
   ```bash
   # Bash
   if [ ! -f "data/traceability_log.csv" ]; then
       echo "BatchID,ToolID,ToolName,TimeShift,Manager,Remark,Timestamp" > data/traceability_log.csv
   fi
   ```

4. Start the development server:
   ```
   pnpm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Usage

### Scanning QR Codes

Make use of QR codes from the test_QR_codes.pdf in the data directory
1. Click "Start Scanner" in the QR Scanner section
2. Allow camera access when prompted
3. Position the QR code within the scanning area 
4. The system will automatically process the batch ID

### Uploading QR Images

1. Click "Choose Image" in the Upload QR Image section
2. Select an image file containing a QR code
3. The system will process the image and extract the batch ID

### Manual Entry

1. Enter an 8-digit batch ID in the Manual Entry section
2. Click "Process BatchID"
3. The system will retrieve and display traceability data

## Sample Data

The application includes sample datasets:

- `batch_dataset.csv`: Contains batch IDs, tool IDs, and time shift information
- `tools_dataset.csv`: Contains tool details, managers, and remarks

You can test the system with the following batch IDs:
- 95822412
- 24942603
- 13356886

## Project Structure

```
smart-traceability-system/
├── app/                 # Next.js application directory
│   ├── api/             # API routes
│   │   ├── decode-qr/   # QR code decoding endpoint
│   │   ├── logs/        # Log retrieval endpoint
│   │   └── traceability/ # Main traceability data endpoint
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main application page
├── components/          # React components
├── data/                # CSV data files
│   ├── batch_dataset.csv
│   ├── tools_dataset.csv
│   └── traceability_log.csv
├── lib/                 # Utility functions
└── public/              # Static assets
```

## Customization

### Adding New Tools

Update the `tools_dataset.csv` file with new tool entries:

```
ToolID,ToolName,TimeShift,Manager,Remark
T_0004,Quality Testing,Morning,James Wilson,New calibration equipment
```

### Adding New Batches

Update the `batch_dataset.csv` file with new batch entries:

```
BatchID,ToolID,TimeShift,Timestamp
87654321,T_0001,Morning,2025-07-10 08:30:00
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
