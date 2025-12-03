import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FetchReelsRequest {
  platform?: 'instagram' | 'youtube' | 'both';
  limit?: number;
  category?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: FetchReelsRequest = await req.json();
    const platform = body.platform || 'both';
    const limit = Math.min(body.limit || 10, 50);

    const reels = [];

    if (platform === 'instagram' || platform === 'both') {
      const instagramReels = [
        {
          platform: 'instagram',
          platform_video_id: 'ig_001',
          title: 'Morning Routine That Changed My Life',
          creator: 'Fitness Guru',
          creator_handle: '@fitnessguru',
          thumbnail_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
          video_url: 'https://example.com/video1.mp4',
          views: 2300000,
          likes: 145000,
          shares: 8900,
          comments_count: 12400,
          engagement_rate: 6.8,
          duration_seconds: 45,
          posted_at: new Date(Date.now() - 86400000).toISOString(),
          category: ['fitness', 'lifestyle', 'motivation'],
          metadata: {
            hook_analysis: 'Opens with bold statement and immediate visual action',
            pacing_notes: 'Quick cuts every 2-3 seconds, text overlays sync with audio',
            audio_tip: 'Trending motivational audio with bass drops'
          },
          is_approved: true
        },
        {
          platform: 'instagram',
          platform_video_id: 'ig_002',
          title: 'POV: You Finally Got Your Dream Setup',
          creator: 'Tech Setups',
          creator_handle: '@techsetups',
          thumbnail_url: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400',
          video_url: 'https://example.com/video2.mp4',
          views: 1800000,
          likes: 125000,
          shares: 7200,
          comments_count: 9800,
          engagement_rate: 7.2,
          duration_seconds: 55,
          posted_at: new Date(Date.now() - 172800000).toISOString(),
          category: ['tech', 'lifestyle', 'setup'],
          metadata: {
            hook_analysis: 'POV format creates immediate viewer immersion',
            pacing_notes: 'Slow reveal with dramatic music build-up',
            audio_tip: 'Cinematic transition sounds and bass-heavy reveal'
          },
          is_approved: true
        }
      ];
      reels.push(...instagramReels.slice(0, limit));
    }

    if ((platform === 'youtube' || platform === 'both') && reels.length < limit) {
      const youtubeReels = [
        {
          platform: 'youtube',
          platform_video_id: 'yt_001',
          title: '5 Habits of Highly Successful People',
          creator: 'Productivity Pro',
          creator_handle: '@productivitypro',
          thumbnail_url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
          video_url: 'https://example.com/video3.mp4',
          views: 5100000,
          likes: 328000,
          shares: 12400,
          comments_count: 21500,
          engagement_rate: 6.4,
          duration_seconds: 58,
          posted_at: new Date(Date.now() - 259200000).toISOString(),
          category: ['education', 'productivity', 'business'],
          metadata: {
            hook_analysis: 'Curiosity gap - Nobody talks about this technique',
            pacing_notes: 'Numbered list format, each point under 10 seconds',
            audio_tip: 'Voiceover with subtle background music'
          },
          is_approved: true
        },
        {
          platform: 'youtube',
          platform_video_id: 'yt_002',
          title: 'The Science of Viral Content Creation',
          creator: 'Content Creator Daily',
          creator_handle: '@creatorsdaily',
          thumbnail_url: 'https://images.pexels.com/photos/1444716/pexels-photo-1444716.jpeg?auto=compress&cs=tinysrgb&w=400',
          video_url: 'https://example.com/video4.mp4',
          views: 3200000,
          likes: 198000,
          shares: 8700,
          comments_count: 14200,
          engagement_rate: 6.9,
          duration_seconds: 52,
          posted_at: new Date(Date.now() - 345600000).toISOString(),
          category: ['content', 'marketing', 'education'],
          metadata: {
            hook_analysis: 'Educational hook with data-driven insights',
            pacing_notes: 'Mix of B-roll and talking head, 3-5 second clips',
            audio_tip: 'Professional voiceover with royalty-free background music'
          },
          is_approved: true
        }
      ];
      reels.push(...youtubeReels.slice(0, limit - reels.length));
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: reels,
        count: reels.length
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error fetching viral reels:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reels'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500
      }
    );
  }
});
