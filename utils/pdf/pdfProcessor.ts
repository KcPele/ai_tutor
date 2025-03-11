import * as pdfjs from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ProcessPDFResult {
  text: string;
  numPages: number;
  title?: string;
}

interface PDFMetadata {
  info: {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    [key: string]: unknown;
  };
  metadata: unknown;
}

/**
 * Process a PDF file and extract its content
 */
export async function processPDF(
  fileBuffer: ArrayBuffer
): Promise<ProcessPDFResult> {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: fileBuffer });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    let fullText = "";

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      // Extract and join text items
      const pageText = content.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ");

      fullText += pageText + "\n\n";
    }

    // Extract document title if available
    let title;
    try {
      const metadata = (await pdf.getMetadata()) as PDFMetadata;
      title = metadata.info?.Title || undefined;
    } catch (error) {
      console.warn("Could not extract PDF metadata:", error);
    }

    return {
      text: fullText,
      numPages,
      title,
    };
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw new Error("Failed to process PDF file");
  }
}

/**
 * Split PDF text into chunks for AI processing
 */
export function splitIntoChunks(text: string, chunkSize = 4000): string[] {
  const chunks: string[] = [];

  // Split by paragraphs first to maintain context
  const paragraphs = text.split(/\n\s*\n/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, push current chunk and start a new one
    if (
      currentChunk.length + paragraph.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }

    currentChunk += paragraph + "\n\n";
  }

  // Add the last chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
