# AI Teaching App - Context

## Overview

The AI Teaching App is an interactive learning platform that leverages AI models to teach users based on uploaded materials. The app features a real-time whiteboard for enhanced learning and provides a conversational interface for engaging interactions.

## Tech Stack

- **AI Model**: ChatGPT (via OpenAI API)
- **Frontend**: Next.js
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN/UI

## Features

1. **AI Tutor Selection**: Users can interact with ChatGPT as their AI tutor.
2. **Material Upload**: Users upload PDFs, which the AI processes to generate teaching content.
3. **Whiteboard Interaction**:
   - The AI dynamically writes key points on a whiteboard during lessons.
   - When explaining concepts, especially in mathematical PDFs, the AI will write equations, formulas, and steps as an actual tutor would, rather than just calling functions.
   - The whiteboard will serve as an interactive teaching aid without requiring user-triggered functions.
4. **Conversational Learning**: Users can chat with the AI to ask questions and get explanations in real time.

## Development Considerations

- **Frontend UI**:
  - Use Tailwind CSS for styling.
  - Leverage ShadCN components for a sleek and responsive design.
- **AI Integration**:
  - Use OpenAI's API to process and extract information from PDFs.
  - Enable real-time interactions with AI responses.
- **Whiteboard Implementation**:
  - Develop a canvas-based whiteboard where AI writes and visualizes content automatically during explanations.
  - Implement AI-driven handwriting for formulas, equations, and structured explanations similar to a human tutor.
- **PDF Processing**:
  - Extract and interpret key information for AI explanations.
  - Optimize for structured content like mathematical notation and diagrams.

## Next Steps

- Implement AI API integration.
- Design the frontend layout with Tailwind and ShadCN.
- Develop the automated whiteboard feature.
- Set up file upload and parsing for PDF materials.

This document provides the foundational context for developing the AI Teaching App. Further refinements can be made as the project evolves.
