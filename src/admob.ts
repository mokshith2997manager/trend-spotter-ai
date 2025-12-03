import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export async function initAds(): Promise<void> {
  await AdMob.initialize({
    initializeForTesting: false,
  });
}

export async function showBottomBanner(): Promise<void> {
  await AdMob.showBanner({
    adId: "ca-app-pub-5330308941809493/1654621730",
    adSize: BannerAdSize.BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
  });
}

export async function hideBanner(): Promise<void> {
  await AdMob.hideBanner();
}

export async function removeBanner(): Promise<void> {
  await AdMob.removeBanner();
}
