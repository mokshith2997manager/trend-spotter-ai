import { AdMob, BannerAdSize, BannerAdPosition, RewardAdPluginEvents, type AdMobRewardItem } from '@capacitor-community/admob';

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

// Rewarded Video Ad - Replace with your real rewarded ad unit ID
const REWARDED_AD_ID = "ca-app-pub-5330308941809493/REWARDED_UNIT_ID";

export async function prepareRewardedAd(): Promise<void> {
  await AdMob.prepareRewardVideoAd({
    adId: REWARDED_AD_ID,
  });
}

export async function showRewardedAd(): Promise<AdMobRewardItem | null> {
  return new Promise(async (resolve) => {
    let resolved = false;

    const cleanup = () => {
      resolved = true;
    };

    // Listen for reward event
    const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
      if (!resolved) {
        cleanup();
        rewardListener.remove();
        resolve(reward);
      }
    });

    // Listen for dismissed without reward
    const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      if (!resolved) {
        cleanup();
        dismissListener.remove();
        resolve(null);
      }
    });

    // Listen for failed to show
    const failedListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
      if (!resolved) {
        cleanup();
        failedListener.remove();
        resolve(null);
      }
    });

    try {
      await AdMob.showRewardVideoAd();
    } catch (error) {
      if (!resolved) {
        cleanup();
        rewardListener.remove();
        dismissListener.remove();
        failedListener.remove();
        resolve(null);
      }
    }
  });
}
