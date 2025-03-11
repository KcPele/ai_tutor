"use client";

import { useState, useRef, ChangeEvent } from "react";
import { UploadCloud, FileText, X, Check } from "lucide-react";
import { processPDF } from "@/utils/pdf/pdfProcessor";

interface PDFUploaderProps {
  onPDFProcessed: (result: {
    text: string;
    numPages: number;
    title?: string;
    filename: string;
  }) => void;
  className?: string;
}

export function AIPDFUploaderComponent({
  onPDFProcessed,
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

    setFile(selectedFile);
    setProcessing(true);

    try {
      // Read file as ArrayBuffer
      const fileBuffer = await selectedFile.arrayBuffer();

      // Process the PDF
      const result = await processPDF(fileBuffer);

      // Call the callback with the processed result
      onPDFProcessed({
        ...result,
        filename: selectedFile.name,
      });

      setSuccess(true);
    } catch (err) {
      console.error("PDF processing error:", err);
      setError("Failed to process PDF. Please try again.");
    } finally {
      setProcessing(false);
    }
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
