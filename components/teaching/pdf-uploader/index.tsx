"use client";

import { useState, useRef, ChangeEvent } from "react";
import { UploadCloud, FileText, X, Check } from "lucide-react";

interface PDFUploaderProps {
  onPDFProcessed: (result: {
    text: string;
    numPages: number;
    title?: string;
    filename: string;
  }) => void;
  onPDFSuccess?: () => void;
  className?: string;
}

export function AIPDFUploaderComponent({
  onPDFProcessed,
  onPDFSuccess,
  className = "",
}: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    // Reset states
    setError(null);
    setSuccess(false);

    // Validate file type
    if (!selectedFile.type.includes("pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setError(
        `File size exceeds 10MB limit (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`
      );
      return;
    }

    setFile(selectedFile);
    setProcessing(true);

    try {
      // Create a simple object URL from the file for display
      const objectUrl = URL.createObjectURL(selectedFile);

      // Read file content
      const text = await extractTextFromPDF(selectedFile);

      // Call the callback with the processed result
      onPDFProcessed({
        text,
        numPages: 1, // We don't have actual page count in this simple approach
        filename: selectedFile.name,
      });

      setSuccess(true);

      // Notify parent component that processing succeeded
      if (onPDFSuccess) {
        onPDFSuccess();
      }
    } catch (err) {
      console.error("File handling error:", err);
      setError("Failed to process the PDF. Please try a different file.");
    } finally {
      setProcessing(false);
    }
  };

  // Simple text extraction function that works without PDF.js worker
  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            // Get the array buffer
            const arrayBuffer = e.target?.result as ArrayBuffer;

            // Simple approach: convert to Base64 and extract readable strings
            // This is a basic approach and won't work for all PDFs, but it's better than nothing
            const binary = new Uint8Array(arrayBuffer);
            let text = "";

            // Extract all printable ASCII characters
            for (let i = 0; i < binary.length; i++) {
              const byte = binary[i];
              // Filter for printable ASCII characters
              if (byte >= 32 && byte <= 126) {
                text += String.fromCharCode(byte);
              } else if (byte === 10 || byte === 13) {
                // Add newlines
                text += "\n";
              }
            }

            // Clean up the text by removing non-word sequences and excessive whitespace
            text = text
              .replace(/[^\w\s.,;:!?'"-]/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            resolve(text);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200 relative
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
          ${success ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
          ${error ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!file ? triggerFileInput : undefined}
      >
        <input
          type="file"
          className="hidden"
          accept="application/pdf"
          onChange={handleInputChange}
          ref={fileInputRef}
          disabled={processing}
        />

        {!file && !processing && (
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="h-12 w-12 text-muted-foreground/70" />
            <h3 className="text-lg font-medium">Upload a PDF file</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your file here or click to browse
            </p>
          </div>
        )}

        {file && !processing && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              {success && <Check className="h-5 w-5 text-green-500" />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="rounded-full p-1 hover:bg-muted"
                aria-label="Remove file"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {processing && (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm font-medium">Processing PDF...</p>
          </div>
        )}

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>

      {!file && (
        <p className="text-xs text-muted-foreground mt-2">
          Supported file: PDF (max 10MB)
        </p>
      )}
    </div>
  );
}
