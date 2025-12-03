import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReelInput {
  id: string;
  title: string;
  creator: string;
  platform: 'instagram' | 'youtube';
  trendContext?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reels, trendTitle } = await req.json() as { reels: ReelInput[], trendTitle: string };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing ${reels.length} reels for trend: ${trendTitle}`);

    const prompt = `You are a viral content analyst. Analyze these reels and determine their relevance to the trend "${trendTitle}".

For each reel, provide:
1. A relevance score (0-100)
2. Why this reel is relevant (hook analysis)
3. Pacing notes
4. Audio/trend tips
5. Recreation tips (3-4 bullet points)

Reels to analyze:
${reels.map(r => `- "${r.title}" by ${r.creator} (${r.platform})`).join('\n')}

Respond ONLY with valid JSON in this exact format:
{
  "analyses": [
    {
      "id": "reel_id",
      "relevanceScore": 85,
      "hookAnalysis": "Opens with...",
      "pacingNotes": "Quick cuts...",
      "trendUsed": "Trend name",
      "audioTip": "Audio advice...",
      "recreationTips": ["tip1", "tip2", "tip3"]
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a viral content expert. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      throw new Error("Invalid AI response format");
    }

    const analyses = JSON.parse(jsonMatch[0]);
    console.log("Successfully analyzed reels");

    return new Response(JSON.stringify(analyses), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-reels:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
