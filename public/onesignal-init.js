// OneSignal initialization
window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async function(OneSignal) {
  try {
    console.log('Starting OneSignal initialization...');
    
    // Get app ID from window variable (set in index.html)
    const appId = window.ONESIGNAL_APP_ID;
    
    await OneSignal.init({
      appId: appId,
      serviceWorkerPath: "/OneSignalSDKWorker.js"
    });
    
  } catch (error) {
    console.error('OneSignal initialization failed:', error);
  }
});