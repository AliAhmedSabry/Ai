import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FlashcardRequest {
  documentContent: string;
  documentTitle: string;
  count?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { documentContent, documentTitle, count = 10 }: FlashcardRequest = await req.json();

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const prompt = `You are an educational AI assistant. Generate ${count} high-quality flashcards from the following document titled "${documentTitle}".

Document content:
${documentContent}

Create flashcards that:
1. Cover the most important concepts
2. Have clear, concise questions
3. Provide comprehensive answers
4. Include a difficulty level (easy, medium, or hard)

Return ONLY a valid JSON array of flashcards in this exact format:
[
  {
    "question": "Question text here",
    "answer": "Answer text here",
    "difficulty": "easy"
  }
]

Do not include any other text, explanations, or markdown. Only return the JSON array.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    let aiResponse = data.candidates[0].content.parts[0].text;
    
    if (!aiResponse) {
      throw new Error("No response text received from Gemini API");
    }

    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let flashcards;
    try {
      flashcards = JSON.parse(aiResponse);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    if (!Array.isArray(flashcards)) {
      throw new Error("AI response is not an array");
    }
    
    if (flashcards.length === 0) {
      throw new Error("No flashcards were generated");
    }

    return new Response(
      JSON.stringify({ flashcards }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Flashcard generation error:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
