import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReelMetadata {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  platform: 'instagram' | 'youtube';
  views?: string;
  link: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

    console.log(`Fetching metadata for: ${url}`);

    // Detect platform
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isInstagram = url.includes('instagram.com');

    if (isYouTube && YOUTUBE_API_KEY) {
      // Extract video ID
      let videoId = '';
      if (url.includes('shorts/')) {
        videoId = url.split('shorts/')[1].split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }

      if (videoId) {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          const video = data.items?.[0];
          
          if (video) {
            const viewCount = parseInt(video.statistics?.viewCount || '0');
            const formattedViews = viewCount >= 1000000 
              ? `${(viewCount / 1000000).toFixed(1)}M`
              : viewCount >= 1000 
                ? `${(viewCount / 1000).toFixed(1)}K`
                : viewCount.toString();

            const metadata: ReelMetadata = {
              id: videoId,
              title: video.snippet?.title || 'Unknown',
              creator: `@${video.snippet?.channelTitle || 'unknown'}`,
              thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url || '',
              platform: 'youtube',
              views: formattedViews,
              link: url
            };

            return new Response(JSON.stringify({ metadata }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    }

    // For Instagram or failed YouTube - use AI to generate mock analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (LOVABLE_API_KEY) {
      const prompt = `Analyze this social media URL and provide metadata: ${url}
      
Return JSON with these fields:
{
  "id": "unique_id",
  "title": "descriptive title based on URL",
  "creator": "@creator_handle",
  "platform": "${isInstagram ? 'instagram' : 'youtube'}",
  "views": "estimated views like 1.2M",
  "estimatedViralScore": 75
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
            { role: "system", content: "You are a social media analyst. Respond with valid JSON only." },
            { role: "user", content: prompt }
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const metadata: ReelMetadata = {
            id: parsed.id || Date.now().toString(),
            title: parsed.title || 'Viral Reel',
            creator: parsed.creator || '@creator',
            thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80',
            platform: isInstagram ? 'instagram' : 'youtube',
            views: parsed.views || '500K',
            link: url
          };

          return new Response(JSON.stringify({ metadata, aiGenerated: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Fallback
    return new Response(JSON.stringify({ 
      metadata: {
        id: Date.now().toString(),
        title: 'Viral Content',
        creator: '@creator',
        thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80',
        platform: isInstagram ? 'instagram' : 'youtube',
        views: '100K',
        link: url
      },
      fallback: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in fetch-reel-metadata:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
