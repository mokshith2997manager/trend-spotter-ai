import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TrendAlertPayload {
  trend_id: string;
  trend_title: string;
  current_score: number;
  previous_score: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: TrendAlertPayload = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: users, error: usersError } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('trend_alerts_enabled', true)
      .gte('trend_alert_threshold', payload.current_score);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users to notify',
          notifications_sent: 0
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200
        }
      );
    }

    const notifications = users.map(user => ({
      user_id: user.user_id,
      type: 'trend_alert',
      title: `${payload.trend_title} is trending!`,
      description: `Score jumped from ${payload.previous_score} to ${payload.current_score}`,
      data: {
        trend_id: payload.trend_id,
        current_score: payload.current_score,
        previous_score: payload.previous_score,
        action_url: `/trend/${payload.trend_id}`
      }
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Trend alerts sent',
        notifications_sent: notifications.length
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
    console.error('Error sending trend alert:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send alert'
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
