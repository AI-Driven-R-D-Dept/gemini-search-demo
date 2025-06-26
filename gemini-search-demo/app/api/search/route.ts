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

    // Create structured query for JSON response
    const structuredQuery = `${query}

以下の形式の構造化データで回答してください（JSON形式）:
{
  "results": [
    {
      "title": "サイト名またはページタイトル",
      "description": "内容の詳細説明",
      "comment": "一言コメント"
    }
  ]
}

要約した回答は不要です。構造化データのみを出力してください。`;

    // Make the request
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: structuredQuery,
      config,
    });
    
    const text = response.text;
    
    // Get grounding metadata from the first candidate if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;
    
    // Extract web sources from grounding chunks
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return {
          uri: chunk.web.uri,
          title: chunk.web.title,
          domain: chunk.web.domain
        };
      }
      if (chunk.retrievedContext) {
        return {
          uri: chunk.retrievedContext.uri,
          title: chunk.retrievedContext.title
        };
      }
      return null;
    }).filter(Boolean) || [];

    // Try to parse structured response
    let structuredResults = [];
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        structuredResults = parsed.results || [];
      }
    } catch (error) {
      console.log("Failed to parse structured response, using raw text");
    }

    return NextResponse.json({
      answer: text,
      structuredResults,
      groundingMetadata,
      searchQueries: groundingMetadata?.webSearchQueries || [],
      sources
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