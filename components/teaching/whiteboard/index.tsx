"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Eraser, PenTool, Trash2, Undo, Download } from "lucide-react";

// Dynamic import of fabric.js for client-side only
let fabric: any;
if (typeof window !== "undefined") {
  fabric = require("fabric").fabric;
}

interface FabricCanvas {
  add: (obj: any) => void;
  renderAll: () => void;
  clear: () => void;
  dispose: () => void;
  toJSON: () => any;
  loadFromJSON: (json: string, callback: () => void) => void;
  toDataURL: (options: any) => string;
  backgroundColor: string;
  isDrawingMode: boolean;
  freeDrawingBrush?: {
    color: string;
    width: number;
  };
  on: (eventName: string, callback: () => void) => void;
}

interface FabricObject {
  set: (property: string, value: any) => void;
}

interface AIWhiteboardComponentProps {
  className?: string;
  width?: number;
  height?: number;
}

// Export public methods that can be called via ref
export interface WhiteboardRef {
  writeTextOnCanvas: (
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number;
      color?: string;
      animationSpeed?: number;
    }
  ) => boolean | undefined;
  drawDiagram: (
    type: "circle" | "rectangle" | "arrow",
    x: number,
    y: number,
    options?: {
      width?: number;
      height?: number;
      radius?: number;
      color?: string;
      animationSpeed?: number;
    }
  ) => boolean | undefined;
  clear: () => void;
}

export const AIWhiteboardComponent = forwardRef<
  WhiteboardRef,
  AIWhiteboardComponentProps
>(function AIWhiteboardComponent(
  { className = "", width = 800, height = 600 },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize the canvas when the component mounts
  useEffect(() => {
    // Skip if running on server or no canvas element
    if (typeof window === "undefined" || !canvasRef.current || !fabric) return;

    // Create a new fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#f8f9fa",
      isDrawingMode: true,
    });

    // Set initial brush settings
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 2;
      canvas.freeDrawingBrush.color = "#000000";
    }

    // Save canvas state to history when path is created
    canvas.on("path:created", () => {
      saveCanvasState(canvas);
    });

    fabricCanvasRef.current = canvas;

    // Initialize history with empty canvas
    saveCanvasState(canvas);

    // Clean up
    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  // Save current canvas state to history
  const saveCanvasState = (canvas: FabricCanvas) => {
    const currentState = canvas.toJSON();
    const jsonString = JSON.stringify(currentState);

    // Remove future states if we're in the middle of history
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      return [...newHistory, jsonString];
    });

    setHistoryIndex((prev) => prev + 1);
  };

  // Handle undo action
  const handleUndo = () => {
    if (historyIndex <= 0 || !fabricCanvasRef.current) return;

    const newIndex = historyIndex - 1;
    const state = history[newIndex];

    fabricCanvasRef.current.loadFromJSON(state, () => {
      fabricCanvasRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  // Handle clear action
  const handleClear = () => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = "#f8f9fa";
    fabricCanvasRef.current.renderAll();

    saveCanvasState(fabricCanvasRef.current);
  };

  // Switch to pen tool
  const handlePenMode = () => {
    if (!fabricCanvasRef.current || !fabricCanvasRef.current.freeDrawingBrush)
      return;

    setTool("pen");
    fabricCanvasRef.current.isDrawingMode = true;
    fabricCanvasRef.current.freeDrawingBrush.color = "#000000";
    fabricCanvasRef.current.freeDrawingBrush.width = 2;
  };

  // Switch to eraser tool
  const handleEraserMode = () => {
    if (!fabricCanvasRef.current || !fabricCanvasRef.current.freeDrawingBrush)
      return;

    setTool("eraser");
    fabricCanvasRef.current.isDrawingMode = true;
    fabricCanvasRef.current.freeDrawingBrush.color = "#f8f9fa"; // Same as background
    fabricCanvasRef.current.freeDrawingBrush.width = 20;
  };

  // Download the whiteboard as an image
  const handleDownload = () => {
    if (!fabricCanvasRef.current) return;

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "ai-teaching-whiteboard.png";
    link.click();
  };

  // AI Writing function - exposed for AI integration
  const writeTextOnCanvas = (
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number;
      color?: string;
      animationSpeed?: number;
    }
  ) => {
    if (!fabricCanvasRef.current || typeof window === "undefined" || !fabric)
      return;

    const canvas = fabricCanvasRef.current;
    const fontSize = options?.fontSize || 20;
    const color = options?.color || "#000000";
    const animationSpeed = options?.animationSpeed || 50; // ms between characters

    // Create text object using the dynamic fabric import
    const textObj = new fabric.Text("", {
      left: x,
      top: y,
      fontFamily: "Arial",
      fontSize,
      fill: color,
      selectable: false,
    }) as FabricObject;

    canvas.add(textObj);

    // Animate writing text character by character
    let currentIndex = 0;
    const writeNextChar = () => {
      if (currentIndex < text.length) {
        textObj.set("text", text.substring(0, currentIndex + 1));
        canvas.renderAll();
        currentIndex++;
        setTimeout(writeNextChar, animationSpeed);
      } else {
        saveCanvasState(canvas);
      }
    };

    writeNextChar();

    return true;
  };

  // Public method to draw a simple diagram
  const drawDiagram = (
    type: "circle" | "rectangle" | "arrow",
    x: number,
    y: number,
    options?: {
      width?: number;
      height?: number;
      radius?: number;
      color?: string;
      animationSpeed?: number;
    }
  ) => {
    if (!fabricCanvasRef.current || typeof window === "undefined" || !fabric)
      return;

    const canvas = fabricCanvasRef.current;
    const color = options?.color || "#000000";

    let object: FabricObject;

    switch (type) {
      case "circle":
        const radius = options?.radius || 50;
        object = new fabric.Circle({
          left: x,
          top: y,
          radius,
          fill: "transparent",
          stroke: color,
          strokeWidth: 2,
        });
        break;

      case "rectangle":
        const width = options?.width || 100;
        const height = options?.height || 80;
        object = new fabric.Rect({
          left: x,
          top: y,
          width,
          height,
          fill: "transparent",
          stroke: color,
          strokeWidth: 2,
        });
        break;

      case "arrow":
        // Create arrow using path
        const arrowWidth = options?.width || 100;
        const arrowPath = `M ${x},${y} L ${x + arrowWidth},${y} M ${x + arrowWidth - 10},${y - 10} L ${x + arrowWidth},${y} L ${x + arrowWidth - 10},${y + 10}`;

        object = new fabric.Path(arrowPath, {
          stroke: color,
          strokeWidth: 2,
          fill: "transparent",
        });
        break;

      default:
        return;
    }

    canvas.add(object);
    canvas.renderAll();
    saveCanvasState(canvas);

    return true;
  };

  // Expose methods via ref for parent components to use
  useImperativeHandle(
    ref,
    () => ({
      writeTextOnCanvas,
      drawDiagram,
      clear: handleClear,
    }),
    []
  );

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex space-x-2">
          <button
            onClick={handlePenMode}
            className={`p-2 rounded ${
              tool === "pen"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
            aria-label="Pen tool"
          >
            <PenTool className="h-5 w-5" />
          </button>
          <button
            onClick={handleEraserMode}
            className={`p-2 rounded ${
              tool === "eraser"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
            aria-label="Eraser tool"
          >
            <Eraser className="h-5 w-5" />
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleUndo}
            className="p-2 rounded bg-muted hover:bg-muted/80"
            disabled={historyIndex <= 0}
            aria-label="Undo"
          >
            <Undo className="h-5 w-5" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded bg-muted hover:bg-muted/80"
            aria-label="Clear whiteboard"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded bg-muted hover:bg-muted/80"
            aria-label="Download whiteboard"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
});
