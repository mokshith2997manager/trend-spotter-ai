import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.hypelens',
  appName: 'HypeLens AI',
  webDir: 'dist',
  server: {
    // Development mode: point to the Lovable sandbox for hot reload
    url: 'https://1852400c-0792-4b0f-ae39-f3610a8544fa.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0c1222',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0c1222'
    }
  }
};

export default config;