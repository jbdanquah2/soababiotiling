let filesToCache = resourceToCache();

const staticCacheName = 'soababio-v2';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Activating new service worker...');
  
  const cacheAllowlist = [staticCacheName];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request).then(response => {
          // Respond with custom 404 page
          if (response.status === 404) {
            console.log('404 ', event.request.url, ' not founds');
            return caches.match('/not-found.html');
          }
          return caches.open(staticCacheName).then(cache => {
            cache.put(event.request.url, response.clone());
            return response;
          }).catch(er => {
            console.log('not from network: ', er);
          });
        });

      }).catch(error => {
        console.log("Hey your app is offline", error);
        //Respond with custom offline page
        return caches.match('/offline.html');
      })
  );
});

function resourceToCache() {
  return [
    '/',
    'css/business-casual.min.css',
    'css/ionicons.min.css',
    'index.html',
    'offline.html',
    'not-found.html',
    'vendor/all.min.js',
    'js/main.js',
    'vendor/jquery/jquery.min.js',
    'vendor/bootstrap/js/bootstrap.min.js',
    'vendor/bootstrap/css/bootstrap.min.css',
    'img/icons/android-chrome-192x192.png',
    'img/icons/android-chrome-384x384.png',
    'img/icons/apple-touch-icon.png',
    'img/icons/browserconfig.xml',
    'img/icons/favicon.ico',
    'img/icons/favicon-16x16.png',
    'img/icons/favicon-32x32.png',
    'img/icons/mstile-150x150.png',
    'site.webmanifest'
  ];
}
