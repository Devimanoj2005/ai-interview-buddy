import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { transcript, role, level, techStack } = await req.json();

    if (!transcript || !Array.isArray(transcript)) {
      throw new Error('Transcript is required and must be an array');
    }

    const transcriptText = transcript
      .map((entry: { speaker: string; text: string }) => `${entry.speaker}: ${entry.text}`)
      .join('\n');

    const systemPrompt = `You are an expert technical interviewer and career coach with 15+ years of experience hiring for top tech companies. Analyze the following interview transcript thoroughly and provide accurate, calibrated feedback.

The interview was for a ${level} ${role} position focusing on: ${techStack.join(', ')}.

SCORING GUIDELINES (be strict and accurate):
- 90-100: Exceptional - Would be a strong hire at top companies. Deep expertise, articulate, innovative solutions.
- 80-89: Strong - Above average candidate. Good technical depth, clear communication, solid problem-solving.
- 70-79: Competent - Meets expectations for the level. Has the basics down but room for improvement.
- 60-69: Needs Improvement - Below expectations. Gaps in knowledge or communication issues.
- Below 60: Significant gaps - Major areas need work before being interview-ready.

EVALUATE EACH DIMENSION:
1. Technical Knowledge (0-100): 
   - Accuracy of technical statements
   - Depth of understanding (not just surface-level answers)
   - Breadth across mentioned technologies
   - Use of correct terminology
   - Quality of examples provided

2. Communication (0-100): 
   - Clarity and structure of responses
   - Ability to explain complex concepts simply
   - Appropriate level of detail
   - Active listening (addressing what was asked)
   - Professional language use

3. Problem Solving (0-100): 
   - Logical approach to questions
   - Breaking down complex problems
   - Considering edge cases
   - Trade-off analysis
   - Creative solutions

IMPORTANT: Calculate overallScore as a weighted average: Technical (40%) + Communication (30%) + Problem Solving (30%)

Provide your analysis in the following JSON format:
{
  "overallScore": <number 0-100 - weighted average>,
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "problemSolvingScore": <number 0-100>,
  "strengths": ["<specific strength with example from transcript>", "<strength 2>", "<strength 3>"],
  "improvements": ["<specific area to improve with actionable advice>", "<area 2>", "<area 3>"],
  "detailedFeedback": "<2-3 paragraph detailed feedback referencing specific answers from the transcript. Include what went well and what could be improved with concrete examples.>"
}

Be specific and quote actual responses from the transcript. Provide calibrated scores - don't inflate them.`;

    console.log('Analyzing interview transcript...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this interview transcript:\n\n${transcriptText}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    console.log('Analysis complete:', {
      overallScore: analysis.overallScore,
      technicalScore: analysis.technicalScore,
    });

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing interview:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
