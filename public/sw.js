const CACHE_NAME = 'dangit-v1.0.0';
const urlsToCache = [
  '/',
  '/manifest.json'
];


// Install event
self.addEventListener('install', (event) => {
  console.log('DANGIT Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('DANGIT Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Replace the fetch event listener in your sw.js with this:
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) {
    // Network first for API calls
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// Background sync for saving content when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline content saving
  console.log('Background sync triggered');
}

// ENHANCED: Push notifications with mobile reminder support
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData;
  
  // Handle different types of push data
  if (event.data) {
    try {
      // Try to parse as JSON first (for our mobile reminders)
      notificationData = event.data.json();
    } catch (e) {
      // Fallback to text (for your existing notifications)
      notificationData = {
        title: 'DANGIT',
        body: event.data.text() || 'New content suggestion!',
        icon: '/icons/icon-192x192.png'
      };
    }
  } else {
    // Default notification
    notificationData = {
      title: 'DANGIT',
      body: 'New content suggestion!',
      icon: '/icons/icon-192x192.png'
    };
  }

  // Enhanced notification options
  const options = {
    body: notificationData.body || 'New content suggestion!',
    icon: notificationData.icon || '/icons/web-app-manifest-192x192.png',
    badge: '/icons/favicon-96x96.png',
    vibrate: [200, 100, 200], // Mobile vibration pattern
    requireInteraction: notificationData.requireInteraction || false,
    silent: false,
    tag: notificationData.tag || 'dangit-notification',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || '1',
      url: notificationData.url || '/',
      type: notificationData.type || 'general'
    },
    actions: [
      {
        action: 'open',
        title: notificationData.actions?.[0]?.title || 'Open App',
        icon: '/icons/web-app-manifest-192x192.png'
      },
      {
        action: 'dismiss',
        title: notificationData.actions?.[1]?.title || 'Dismiss',
        icon: '/icons/favicon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'DANGIT', 
      options
    )
  );
});

// ENHANCED: Handle notification clicks with mobile reminder support
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  
  event.notification.close();
  
  // Handle different actions
  if (event.action === 'open') {
    event.waitUntil(openApp(event.notification.data?.url));
  } else if (event.action === 'dismiss') {
    // Just close the notification (already closed above)
    console.log('Notification dismissed');
  } else if (event.action === 'snooze') {
    // Handle snooze for mobile reminders
    event.waitUntil(handleSnooze(event.notification));
  } else {
    // Default click behavior - open app
    event.waitUntil(openApp(event.notification.data?.url));
  }
});

// ENHANCED: Open app function with better window management
async function openApp(targetUrl = '/') {
  const clients = await self.clients.matchAll({ 
    type: 'window',
    includeUncontrolled: true 
  });
  
  // If app is already open, focus it
  for (const client of clients) {
    if (client.url.includes(self.registration.scope)) {
      console.log('Focusing existing app window');
      if (targetUrl && targetUrl !== '/') {
        // Navigate to specific URL if provided
        client.navigate(targetUrl);
      }
      return client.focus();
    }
  }
  
  // Otherwise open new window
  if (self.clients.openWindow) {
    console.log('Opening new app window:', targetUrl);
    return self.clients.openWindow(targetUrl);
  }
}

// NEW: Handle snooze functionality for mobile reminders
async function handleSnooze(notification) {
  console.log('Snoozing notification for 10 minutes');
  
  // Schedule a new notification in 10 minutes
  setTimeout(() => {
    const snoozeOptions = {
      body: `Snoozed: ${notification.body}`,
      icon: notification.icon,
      badge: notification.badge,
      vibrate: [200, 100, 200],
      tag: `snooze-${notification.tag}`,
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };
    
    self.registration.showNotification(
      'DANGIT Reminder (Snoozed) 💤',
      snoozeOptions
    );
  }, 10 * 60 * 1000); // 10 minutes
}

// NEW: Handle scheduled mobile reminders
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
    const { title, body, delay, tag, itemId } = event.data;
    
    // Schedule the reminder
    setTimeout(() => {
      const options = {
        body: body,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/favicon-96x96.png',
        vibrate: [200, 100, 200, 100, 200], // Double vibration for reminders
        requireInteraction: true,
        silent: false,
        tag: tag,
        data: {
          dateOfArrival: Date.now(),
          itemId: itemId,
          type: 'reminder',
          url: '/'
        },
        actions: [
          {
            action: 'open',
            title: 'Open Item',
            icon: '/icons/web-app-manifest-192x192.png'
          },
          {
            action: 'snooze',
            title: 'Snooze 10min',
            icon: '/icons/favicon-96x96.png'
          }
        ]
      };
      
      self.registration.showNotification(title, options);
      console.log('Mobile reminder notification shown:', title);
    }, delay);
    
    console.log(`Mobile reminder scheduled for ${delay}ms from now`);
  }
});

// NEW: Cleanup function for cancelled reminders
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CANCEL_REMINDER') {
    const { tag } = event.data;
    
    // Get all notifications and close the matching one
    self.registration.getNotifications({ tag: tag }).then(notifications => {
      notifications.forEach(notification => {
        notification.close();
        console.log('Cancelled reminder notification:', tag);
      });
    });
  }
});

// Background fetch for content processing (your existing feature enhanced)
self.addEventListener('backgroundfetch', (event) => {
  console.log('Background fetch triggered:', event.tag);
  
  if (event.tag === 'content-processing') {
    event.waitUntil(handleBackgroundContentProcessing(event));
  }
});

async function handleBackgroundContentProcessing(event) {
  console.log('Processing content in background...');
  // Your existing content processing logic can go here
}

// Performance monitoring and error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection:', event.reason);
});

// Log when service worker becomes idle/active
self.addEventListener('activate', () => {
  console.log('DANGIT Service Worker is now active and ready for mobile notifications! 📱');
});

console.log('DANGIT Service Worker loaded with mobile reminder support! 🚀');
