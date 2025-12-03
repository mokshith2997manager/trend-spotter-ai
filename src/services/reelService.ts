import { supabase } from '@/integrations/supabase/client';
import { UserReel } from '@/types/database';

export class ReelService {
  static async getUserReels(userId: string): Promise<UserReel[]> {
    try {
      const { data, error } = await supabase
        .from('user_reels')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user reels:', error);
      return [];
    }
  }

  static async getReelById(reelId: string): Promise<UserReel | null> {
    try {
      const { data, error } = await supabase
        .from('user_reels')
        .select('*')
        .eq('id', reelId)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching reel:', error);
      return null;
    }
  }

  static async createReel(reel: Omit<UserReel, 'id' | 'created_at' | 'updated_at'>): Promise<UserReel | null> {
    try {
      const { data, error } = await supabase
        .from('user_reels')
        .insert([reel])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating reel:', error);
      return null;
    }
  }

  static async updateReel(reelId: string, updates: Partial<UserReel>): Promise<UserReel | null> {
    try {
      const { data, error } = await supabase
        .from('user_reels')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reelId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating reel:', error);
      return null;
    }
  }

  static async deleteReel(reelId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_reels')
        .delete()
        .eq('id', reelId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting reel:', error);
      return false;
    }
  }

  static async publishReel(reelId: string): Promise<UserReel | null> {
    return this.updateReel(reelId, { status: 'published' });
  }

  static async unpublishReel(reelId: string): Promise<UserReel | null> {
    return this.updateReel(reelId, { status: 'draft' });
  }

  static async archiveReel(reelId: string): Promise<UserReel | null> {
    return this.updateReel(reelId, { status: 'archived' });
  }

  static async getPublishedReels(limit: number = 10): Promise<UserReel[]> {
    try {
      const { data, error } = await supabase
        .from('user_reels')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching published reels:', error);
      return [];
    }
  }

  static async incrementViews(reelId: string): Promise<void> {
    try {
      const reel = await this.getReelById(reelId);
      if (reel) {
        await this.updateReel(reelId, { views: reel.views + 1 });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  static async likeReel(reelId: string): Promise<void> {
    try {
      const reel = await this.getReelById(reelId);
      if (reel) {
        await this.updateReel(reelId, { likes: reel.likes + 1 });
      }
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  }

  static async shareReel(reelId: string): Promise<void> {
    try {
      const reel = await this.getReelById(reelId);
      if (reel) {
        await this.updateReel(reelId, { shares: reel.shares + 1 });
      }
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  }

  static async uploadVideo(file: Blob, userId: string): Promise<string | null> {
    try {
      const fileName = `reel_${userId}_${Date.now()}.webm`;

      const { data, error } = await supabase.storage
        .from('user_reels')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('user_reels')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      return null;
    }
  }

  static async generateThumbnail(videoUrl: string): Promise<string | null> {
    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(1, video.duration / 2);
        };

        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(video, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve(null);
          }
        };

        video.onerror = () => {
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }
}