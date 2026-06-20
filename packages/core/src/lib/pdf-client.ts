import * as pdfjs from 'pdfjs-dist'
import { AppError, handleError, getErrorMessage } from '@/lib/error-handler'

// Set the worker source to CDN for simplicity in Next.js environment
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50MB limit
const SUPPORTED_MIME_TYPES = ['application/pdf']

/**
 * Validates if a file is a valid PDF.
 */
function validatePdfFile(file: File): void {
  if (!file) {
    throw new AppError('No file provided', 'NO_FILE', 400)
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    throw new AppError(
      'Invalid file type. Only PDF files are supported.',
      'INVALID_FILE_TYPE',
      400,
      { receivedType: file.type }
    )
  }

  if (file.size === 0) {
    throw new AppError('File is empty', 'EMPTY_FILE', 400)
  }

  if (file.size > MAX_PDF_SIZE) {
    throw new AppError(
      `File is too large. Maximum size is ${MAX_PDF_SIZE / 1024 / 1024}MB.`,
      'FILE_TOO_LARGE',
      413,
      { fileSize: file.size, maxSize: MAX_PDF_SIZE }
    )
  }
}

/**
 * Extracts all text from a PDF file using PDF.js.
 * This runs on the client-side to leverage browser capabilities.
 */
export async function getPdfText(file: File): Promise<string> {
  try {
    validatePdfFile(file)

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: false,
    })

    const pdf = await loadingTask.promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()

        // Sort text items by coordinate to handle multi-column layouts correctly:
        // transform[4] is X coordinate, transform[5] is Y coordinate.
        const sortedItems = [...textContent.items].sort((a: any, b: any) => {
          const aX = a.transform?.[4] ?? 0
          const aY = a.transform?.[5] ?? 0
          const bX = b.transform?.[4] ?? 0
          const bY = b.transform?.[5] ?? 0

          const yDiff = bY - aY
          // Tolerance threshold of 5 units to group items on roughly the same line
          if (Math.abs(yDiff) > 5) {
            return yDiff
          }
          return aX - bX
        })

        // Build page text preserving line breaks by inserting \n between
        // items whose Y coordinate differs by more than 5 units (different lines).
        let prevY: number | null = null
        const pageLines: string[] = []
        let currentLine = ''

        for (const item of sortedItems) {
          if (!item || typeof item !== 'object' || !('str' in item)) continue
          const str = typeof item.str === 'string' ? item.str : ''
          if (!str.trim()) continue

          const itemY = item.transform?.[5] ?? 0

          if (prevY !== null && Math.abs(itemY - prevY) > 5) {
            // New line detected — flush the current line
            if (currentLine.trim()) pageLines.push(currentLine.trim())
            currentLine = str
          } else {
            // Same line — append with space
            currentLine = currentLine ? `${currentLine} ${str}` : str
          }
          prevY = itemY
        }
        if (currentLine.trim()) pageLines.push(currentLine.trim())

        const pageText = pageLines.join('\n')

        fullText += pageText + "\n\n"
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${i}:`, getErrorMessage(pageError))
        // Continue with next page instead of failing completely
      }
    }

    if (!fullText.trim()) {
      throw new AppError(
        'Could not extract any text from the PDF. The file might be image-based or corrupted.',
        'NO_TEXT_EXTRACTED',
        400
      )
    }

    return fullText
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    const appError = handleError(
      error,
      'PDF extraction',
      console
    )
    throw appError
  }
}
