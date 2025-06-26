import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Initialize the client
    const ai = new GoogleGenAI({
      apiKey: apiKey
    });
    
    // Define the grounding tool
    const groundingTool = {
      googleSearch: {},
    };

    // Configure generation settings
    const config = {
      tools: [groundingTool],
    };

    // Make the request
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config,
    });
    
    const text = response.text;
    
    // Get grounding metadata from the first candidate if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

    return NextResponse.json({
      answer: text,
      groundingMetadata,
      searchQueries: groundingMetadata?.webSearchQueries || [],
      sources: groundingMetadata?.groundingChunks || []
    });
  } catch (error) {
    console.error("Search API error:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { 
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}