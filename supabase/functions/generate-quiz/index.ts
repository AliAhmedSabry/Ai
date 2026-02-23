import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuizRequest {
  documentContent: string;
  documentTitle: string;
  questionCount?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { documentContent, documentTitle, questionCount = 5 }: QuizRequest = await req.json();

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const prompt = `You are an educational AI assistant. Generate a ${questionCount}-question multiple choice quiz from the following document titled "${documentTitle}".

Document content:
${documentContent}

Create quiz questions that:
1. Test understanding of key concepts
2. Have 4 answer options each
3. Include one correct answer
4. Provide a brief explanation for the correct answer
5. Progress from easier to harder questions

Return ONLY a valid JSON object in this exact format:
{
  "title": "Quiz title based on document",
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

The correct_answer should be the index (0-3) of the correct option in the options array.
Do not include any other text, explanations, or markdown. Only return the JSON object.`;

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

    let quizData;
    try {
      quizData = JSON.parse(aiResponse);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("AI response does not contain valid questions array");
    }
    
    if (quizData.questions.length === 0) {
      throw new Error("No quiz questions were generated");
    }

    return new Response(
      JSON.stringify(quizData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Quiz generation error:", errorMessage);
    
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
