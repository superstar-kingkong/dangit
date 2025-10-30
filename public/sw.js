// Service Worker for DANGIT
// Handles share target POST requests

const CACHE_NAME = 'dangit-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Fetch event - intercept share target POST requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle share target requests
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  console.log('📥 Share target activated!');
  
  try {
    // Parse the form data
    const formData = await request.formData();
    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const url = formData.get('url') || '';
    const media = formData.get('media'); // Image/video file if shared
    
    console.log('Shared content:', { title, text, url, hasMedia: !!media });
    
    // Store in cache for the ShareScreen to pick up
    const cache = await caches.open(CACHE_NAME);
    const sharedData = {
      title,
      text,
      url,
      hasMedia: !!media,
      timestamp: Date.now()
    };
    
    // Store as a synthetic response
    await cache.put(
      '/share-data',
      new Response(JSON.stringify(sharedData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    // If there's media, store it separately
    if (media) {
      const mediaBlob = await media.arrayBuffer();
      await cache.put(
        '/share-media',
        new Response(mediaBlob, {
          headers: { 'Content-Type': media.type }
        })
      );
    }
    
    // Redirect to the share screen
    return Response.redirect('/share?from=share-target', 303);
    
  } catch (error) {
    console.error('❌ Share target error:', error);
    return Response.redirect('/?error=share-failed', 303);
  }
}

// Optional: Handle background sync for offline shares
self.addEventListener('sync', (event) => {
  if (event.tag === 'share-content') {
    console.log('🔄 Background sync triggered');
    // Handle queued shares when back online
  }
});