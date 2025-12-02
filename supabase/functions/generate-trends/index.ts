import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface AIResponse {
  score: number;
  confidence: 'low' | 'medium' | 'high';
  captions: string[];
  explanation: string;
  suggested_tags: string[];
}

const DEFAULT_SEEDS = ['fashion', 'tech gadgets', 'memes', 'music', 'viral challenges', 'AI tools', 'gaming', 'crypto'];

async function scoreWithAI(candidate: string, sourceSummary: object): Promise<AIResponse> {
  const systemPrompt = `You are TrendEval, a data-aware model that reads short trend candidates and scores their near-term virality. Return a JSON object ONLY (no extra text) with fields: score (0-100 integer), confidence ("low"|"medium"|"high"), captions (array of 2 short social captions, <=120 chars), explanation (2-3 sentences), suggested_tags (array of 3 tags). When you compute score, consider: recency, velocity of mentions, cross-platform signals, cultural fit, and shareability. If signals are absent, be conservative with score.`;

  const userPrompt = `Evaluate this trend candidate: "${candidate}" Sources (if available): ${JSON.stringify(sourceSummary)} Return JSON only.`;

  try {
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      throw new Error('AI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        console.warn('Failed to parse AI JSON response');
      }
    }
    
    return {
      score: 50,
      confidence: 'low',
      captions: [],
      explanation: content || 'Unable to analyze trend',
      suggested_tags: []
    };
  } catch (error) {
    console.error('AI scoring error:', error);
    return {
      score: 50,
      confidence: 'low',
      captions: [],
      explanation: 'LLM error',
      suggested_tags: []
    };
  }
}

// Simulate trend candidates (in production, use Google Trends API, YouTube Data API, etc.)
function generateTrendCandidates(seeds: string[]): string[] {
  const trendPatterns = [
    'aesthetic', 'core', 'wave', 'vibes', 'tok', 'gram', 'drop', 'era',
    'challenge', 'hack', 'trend', 'style', 'fit', 'haul', 'unboxing'
  ];
  
  const candidates = new Set<string>();
  
  // Generate trend-like combinations
  const trendIdeas = [
    'AI Art Generation', 'Cottagecore Fashion', 'Digital Minimalism', 
    'Retro Gaming Revival', 'Sustainable Fashion', 'Micro Workouts',
    'Silent Walking', 'Dopamine Decor', 'Quiet Luxury', 'Chromakopia',
    'Indie Sleaze Revival', 'Mob Wife Aesthetic', 'Cherry Cola Makeup',
    'Protein Coffee', 'Strawberry Girl Aesthetic', 'Coastal Grandmother',
    'Old Money Style', 'Clean Girl Aesthetic', 'Coquette Bow Trend',
    'Tomato Girl Summer', 'Vanilla Girl Era', 'Dark Academia',
    'Light Academia', 'Balletcore', 'Tenniscore', 'Preppy Revival',
    'Y2K Fashion', 'Barbiecore', 'Mermaidcore', 'Fairycore',
    'Goblincore', 'Grandmacore', 'Cottagecore', 'Darkcore'
  ];
  
  trendIdeas.forEach(idea => candidates.add(idea));
  
  seeds.forEach(seed => {
    trendPatterns.forEach(pattern => {
      candidates.add(`${seed} ${pattern}`);
    });
  });
  
  return Array.from(candidates).slice(0, 30);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get seed topics or use defaults
    const seeds = DEFAULT_SEEDS;
    const candidates = generateTrendCandidates(seeds);
    
    console.log(`Processing ${candidates.length} trend candidates`);
    
    const processedTrends = [];
    
    for (const candidate of candidates) {
      // Check if trend already exists and was recently scored
      const { data: existingTrend } = await supabase
        .from('trends')
        .select('*')
        .eq('title', candidate)
        .maybeSingle();
      
      if (existingTrend) {
        const lastScored = new Date(existingTrend.last_scored_at);
        const hoursSinceLastScore = (Date.now() - lastScored.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastScore < 6) {
          console.log(`Skipping ${candidate} - scored ${hoursSinceLastScore.toFixed(1)} hours ago`);
          continue;
        }
      }
      
      const sourceSummary = { source: 'trend_analysis', seed_sample: seeds };
      const aiOutput = await scoreWithAI(candidate, sourceSummary);
      
      const scoreHistory = existingTrend?.score_history || [];
      scoreHistory.push({ ts: new Date().toISOString(), score: aiOutput.score });
      
      const trendDoc = {
        title: candidate,
        score: aiOutput.score,
        confidence_level: aiOutput.confidence,
        examples: aiOutput.captions,
        explain: aiOutput.explanation,
        suggested_tags: aiOutput.suggested_tags,
        raw_ai: JSON.stringify(aiOutput),
        sources: sourceSummary,
        score_history: scoreHistory.slice(-48), // Keep last 48 data points
        last_scored_at: new Date().toISOString(),
      };
      
      if (existingTrend) {
        const { error } = await supabase
          .from('trends')
          .update(trendDoc)
          .eq('id', existingTrend.id);
        
        if (error) console.error('Update error:', error);
        else processedTrends.push({ ...trendDoc, id: existingTrend.id, action: 'updated' });
      } else {
        const { data, error } = await supabase
          .from('trends')
          .insert({ ...trendDoc, created_at: new Date().toISOString() })
          .select()
          .single();
        
        if (error) console.error('Insert error:', error);
        else processedTrends.push({ ...data, action: 'created' });
      }
      
      // Rate limiting - wait between AI calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Processed ${processedTrends.length} trends`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      processed: processedTrends.length,
      trends: processedTrends.slice(0, 10) // Return first 10 for preview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-trends:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});