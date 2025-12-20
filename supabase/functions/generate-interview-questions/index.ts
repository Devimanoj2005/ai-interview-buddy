import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { role, level, techStack, questionCount } = await req.json();

    console.log("Generating questions for:", { role, level, techStack, questionCount });

    const prompt = `Generate ${questionCount} mock interview questions for a ${level} ${role} position.
    
Tech stack focus: ${techStack.join(", ")}

Requirements:
- Include a mix of technical questions (60%) and behavioral questions (40%)
- Technical questions should be appropriate for the ${level} level
- Include at least one system design or architecture question if the level is Intermediate or Advanced
- Make questions specific to the tech stack mentioned
- Each question should be clear and concise

Return the questions as a JSON array with this structure:
{
  "questions": [
    {
      "id": 1,
      "type": "technical" | "behavioral",
      "question": "the question text",
      "followUp": "optional follow-up question"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert technical interviewer. Generate realistic and challenging interview questions. Always respond with valid JSON." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse the JSON response
    let questions;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      questions = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse interview questions");
    }

    console.log("Generated questions:", questions);

    return new Response(
      JSON.stringify(questions),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating questions:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
