import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
  role: string;
  level: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvements: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      name, 
      role, 
      level, 
      overallScore, 
      technicalScore, 
      communicationScore, 
      problemSolvingScore,
      strengths,
      improvements 
    }: EmailRequest = await req.json();

    console.log("Sending interview complete email to:", email);

    const getScoreColor = (score: number) => {
      if (score >= 80) return "#22c55e";
      if (score >= 60) return "#f59e0b";
      return "#ef4444";
    };

    const strengthsList = strengths && strengths.length > 0 
      ? strengths.map(s => `<li style="color: #d0d0d0; font-size: 14px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">✓ ${s}</li>`).join('')
      : '';

    const improvementsList = improvements && improvements.length > 0 
      ? improvements.map(s => `<li style="color: #d0d0d0; font-size: 14px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">→ ${s}</li>`).join('')
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0f0f23;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; border: 1px solid #2d2d44;">
            
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">Interview Complete!</h1>
              <p style="color: #a0a0b0; font-size: 14px; margin: 0;">
                ${name ? `Great job, ${name}!` : 'Great job!'} Here's your performance summary.
              </p>
            </div>

            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <p style="color: #a0a0b0; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Position</p>
              <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">${role}</p>
              <p style="color: #8b5cf6; font-size: 14px; margin: 4px 0 0;">${level}</p>
            </div>

            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, ${getScoreColor(overallScore)}40 0%, ${getScoreColor(overallScore)}20 100%); border: 3px solid ${getScoreColor(overallScore)};">
                <span style="color: ${getScoreColor(overallScore)}; font-size: 36px; font-weight: 700; line-height: 120px;">${overallScore}%</span>
              </div>
              <p style="color: #a0a0b0; font-size: 14px; margin: 12px 0 0;">Overall Score</p>
            </div>

            <table style="width: 100%; margin-bottom: 24px;">
              <tr>
                <td style="width: 33.33%; padding: 8px; text-align: center;">
                  <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px;">
                    <p style="color: ${getScoreColor(technicalScore)}; font-size: 24px; font-weight: 700; margin: 0;">${technicalScore}%</p>
                    <p style="color: #a0a0b0; font-size: 12px; margin: 4px 0 0;">Technical</p>
                  </div>
                </td>
                <td style="width: 33.33%; padding: 8px; text-align: center;">
                  <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px;">
                    <p style="color: ${getScoreColor(communicationScore)}; font-size: 24px; font-weight: 700; margin: 0;">${communicationScore}%</p>
                    <p style="color: #a0a0b0; font-size: 12px; margin: 4px 0 0;">Communication</p>
                  </div>
                </td>
                <td style="width: 33.33%; padding: 8px; text-align: center;">
                  <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px;">
                    <p style="color: ${getScoreColor(problemSolvingScore)}; font-size: 24px; font-weight: 700; margin: 0;">${problemSolvingScore}%</p>
                    <p style="color: #a0a0b0; font-size: 12px; margin: 4px 0 0;">Problem Solving</p>
                  </div>
                </td>
              </tr>
            </table>

            ${strengthsList ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #22c55e; font-size: 14px; margin: 0 0 12px; text-transform: uppercase;">Strengths</h3>
              <ul style="margin: 0; padding: 0; list-style: none;">${strengthsList}</ul>
            </div>
            ` : ''}

            ${improvementsList ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #f59e0b; font-size: 14px; margin: 0 0 12px; text-transform: uppercase;">Areas to Improve</h3>
              <ul style="margin: 0; padding: 0; list-style: none;">${improvementsList}</ul>
            </div>
            ` : ''}

            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #a0a0b0; font-size: 14px; margin: 0;">Keep practicing to improve your scores!</p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Interview Practice <onboarding@resend.dev>",
        to: [email],
        subject: `Your ${role} Interview Results - ${overallScore}% Score`,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending interview complete email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
