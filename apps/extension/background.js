importScripts('config.js');

const ALARM_NAME = 'update-check-alarm';
const CHECK_INTERVAL_MINUTES = 360; // 6 hours

chrome.runtime.onInstalled.addListener(() => {
  // Start the alarm on install/update
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: CHECK_INTERVAL_MINUTES,
  });
  
  // Initial check on install
  checkForUpdates();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    checkForUpdates();
  }
});

async function checkForUpdates() {
  try {
    const res = await fetch(`${CONFIG.BASE_URL}/api/extension/version`);
    if (res.ok) {
      const data = await res.json();
      const currentVersion = chrome.runtime.getManifest().version;
      
      if (data.version && currentVersion !== data.version) {
        // Save the update info to local storage so popup can show it
        chrome.storage.local.set({ extensionUpdate: data });
      } else {
        // Clear if we're up to date
        chrome.storage.local.remove(['extensionUpdate']);
      }
    }
  } catch (err) {
    console.error('Background update check failed:', err);
  }
}
