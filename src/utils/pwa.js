// UPDATED: PWA utilities WITHOUT service worker dependencies

export const showInstallPrompt = () => {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
          installButton.style.display = 'none';
        });
      });
    }
  });
};

// UPDATED: Simple notification setup WITHOUT service worker
export const setupSimpleNotifications = async () => {
  try {
    console.log('Setting up simple browser notifications...');
    
    if (!('Notification' in window)) {
      throw new Error('Browser does not support notifications');
    }

    // Request permission
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Test notification
      new Notification('DANGIT Ready! 🎉', {
        body: 'Browser notifications are now enabled for reminders',
        icon: '/icons/web-app-manifest-192x192.png',
        tag: 'dangit-setup',
      });
      
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Notification setup failed:', error);
    return false;
  }
};

// UPDATED: Simple notification scheduler WITHOUT service worker
export const scheduleNotification = (title, body, delay, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (Notification.permission !== 'granted') {
        reject(new Error('Notification permission not granted'));
        return;
      }

      const timerId = setTimeout(() => {
        try {
          const notification = new Notification(title, {
            body,
            icon: '/icons/web-app-manifest-192x192.png',
            tag: options.tag || 'dangit-reminder',
            ...options
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          resolve(notification);
        } catch (error) {
          // Fallback to alert
          alert(`${title}\n\n${body}`);
          resolve({ fallback: true });
        }
      }, delay);

      // Store timer ID for potential cancellation
      if (options.tag) {
        localStorage.setItem(`timer-${options.tag}`, timerId.toString());
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Cancel scheduled notification
export const cancelNotification = (tag) => {
  const timerId = localStorage.getItem(`timer-${tag}`);
  if (timerId) {
    clearTimeout(parseInt(timerId));
    localStorage.removeItem(`timer-${tag}`);
    console.log(`Cancelled notification with tag: ${tag}`);
    return true;
  }
  return false;
};

// PWA detection
export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

// Check if browser supports notifications
export const notificationsSupported = () => {
  return 'Notification' in window;
};

// Get notification permission status
export const getNotificationPermission = () => {
  if (!notificationsSupported()) return 'not-supported';
  return Notification.permission;
};

// REMOVED: registerSW function (no longer needed)
// REMOVED: setupPushNotifications function (service worker dependent)

console.log('📱 PWA utilities loaded (Simple mode - no service worker)');
