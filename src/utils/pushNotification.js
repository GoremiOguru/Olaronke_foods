/**
 * Utility for requesting Native Web Push Notifications (Home screen / Device notifications)
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support native push notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendNativePushNotification(title, options = {}) {
  try {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const defaultOptions = {
        icon: '/images/jollof_rice.png',
        badge: '/images/jollof_rice.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options
      };

      // Try service worker notification first for background/lockscreen push
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, defaultOptions);
        }).catch(() => {
          new Notification(title, defaultOptions);
        });
      } else {
        new Notification(title, defaultOptions);
      }
    }
  } catch (err) {
    console.warn('Native push notification display notice:', err);
  }
}
