# HypeLens Quick Start Guide

## Accessing New Features

### 1. Landing Screen
**URL**: `http://localhost:5173/landing`

A FamPay-style onboarding experience with 5 swipeable slides:
- Auto-advances every 5 seconds
- Click slides to navigate manually
- Click "Skip" to bypass
- "Get Started" button on final slide

### 2. Create Reel (Video Recording)
**URL**: `http://localhost:5173/create-reel`
**Navigation**: Click "Create" in bottom navigation

Record, edit, and publish short-form videos:
1. Allow camera permission when prompted
2. Click "Start Recording" to begin
3. Click "Stop Recording" to finish
4. Select a filter (5 options with real-time preview)
5. Add title (max 100 chars) and description (max 500 chars)
6. Click "Publish" to save to cloud storage

### 3. Notification Settings
**URL**: `http://localhost:5173/notification-settings`
**Navigation**: Settings → "Manage Notification Settings"

Configure real-time alerts:
- Toggle Trend Alerts, Score Milestones, New Content, Recommendations
- Adjust trend alert threshold (0-100)
- Settings persist automatically

### 4. Viral Reels Inspiration Gallery
**Location**: Home page, below HYPE Score Card

View trending content from Instagram and YouTube:
- Click any reel thumbnail to view details
- See creator info, engagement metrics
- Read hook analysis and creation tips
- Click "Watch Full Video" to open external link

### 5. Bottom Navigation Update
New "Create" button next to existing navigation:
- Home, Discover, Leaders, Profile, **Create** (NEW)

## Key Files

### New Pages
- `src/pages/Landing.tsx` - Onboarding
- `src/pages/CreateReel.tsx` - Reel studio
- `src/pages/NotificationSettings.tsx` - Notification preferences

### New Components
- `src/components/ViralReelsGallery.tsx` - Viral reels grid

### New Services
- `src/services/reelService.ts` - Reel management
- `src/services/notificationService.ts` - Notification handling

### Updated Components
- `src/components/BottomNav.tsx` - Added Create button
- `src/pages/Home.tsx` - Added viral reels gallery
- `src/pages/Settings.tsx` - Added notification settings link
- `src/hooks/useAuth.tsx` - Auto-initialize notification preferences

### Database Types
- `src/types/database.ts` - Added 5 new interfaces

## Database Tables Created

All tables automatically created with migrations:
- `viral_reels` - Trending content
- `user_reels` - User-created videos
- `notifications` - User notifications
- `notification_preferences` - User settings
- `carousel_slides` - Landing slides (for future dynamic content)

Row Level Security enabled on all tables.

## Edge Functions

Both functions already deployed and ready:

### fetch-viral-reels
```javascript
POST /functions/v1/fetch-viral-reels
Body: { platform: 'both', limit: 10 }
```

### send-trend-alert
```javascript
POST /functions/v1/send-trend-alert
Body: {
  trend_id,
  trend_title,
  current_score,
  previous_score
}
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Testing Workflow

### Test Video Recording
1. Go to `/create-reel`
2. Click "Start Recording"
3. Record for 5-10 seconds
4. Click "Stop Recording"
5. Select a filter and watch preview update
6. Add title and description
7. Click "Publish"

### Test Notifications
1. Go to Settings → "Manage Notification Settings"
2. Toggle options on/off
3. Adjust threshold slider
4. Click "Save Settings"
5. Verify settings persist on page reload

### Test Viral Reels
1. Go to Home page
2. Scroll down past HYPE Score Card
3. View viral reels grid (2 columns)
4. Click on any reel to open modal
5. View creator info, metrics, and tips
6. Click "Watch Full Video" button

## Required Storage Bucket

You need to create a Supabase Storage bucket named `user_reels`:

1. Go to Supabase Dashboard
2. Click "Storage" in sidebar
3. Click "Create a new bucket"
4. Name it `user_reels`
5. Set to "Public" for published reels

## Common Issues & Solutions

**Issue**: Camera permission denied
- **Solution**: Check browser permissions, allow camera access, reload page

**Issue**: Video upload fails
- **Solution**: Ensure `user_reels` bucket exists and is public, check internet connection

**Issue**: Notifications not appearing
- **Solution**: Allow notification permission in browser, check notification settings aren't disabled

**Issue**: Viral reels not loading
- **Solution**: Edge function is deployed and working, check network tab for fetch errors

## API Integration (Future)

To connect real Instagram/YouTube APIs:

1. Get API credentials from respective platforms
2. Update edge functions in Supabase
3. Add rate limiting and caching
4. Test with real data

Mock data currently in place for testing.

## Performance Tips

- Videos are compressed before upload
- Thumbnails are lazy-loaded
- Database queries are indexed for speed
- Edge functions are optimized for low latency

## Security Notes

- All user data protected by Row Level Security
- Users can only access their own reels
- Public access limited to approved content
- No credentials stored in client code

## Next Steps

1. **Create `user_reels` bucket** in Supabase Storage
2. **Test video recording** feature
3. **Configure notification permissions** in browser
4. **Connect real Instagram/YouTube APIs** when ready for production
5. **Set up Firebase** for advanced notification features (optional)

## Support Resources

- `FEATURES.md` - Detailed feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical overview
- In-code comments throughout new files
- Service class documentation

---

Ready to start creating! Visit `/create-reel` to record your first reel or `/landing` to see the onboarding flow.