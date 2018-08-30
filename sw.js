if (typeof idb === "undefined") {
    self.importScripts('./node_modules/idb/lib/idb.js');
}
const cacheName = `v1`;

self.addEventListener('install', e => {

  fetch('http://localhost:1337/restaurants').then(function(response) {
    return response.json();
  }).then(function(data) {
    //console.log(data);
    var dbPromise = idb.open('restaurantsDB', 1, function(upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains('restaurants')) {
          var restaurantsOS = upgradeDb.createObjectStore('restaurants');
          restaurantsOS.put(data, 'restaurants');
        }
      });
  }).catch(function(error) {
    console.log('Request failed', error);  
  });


    const timeStamp = Date.now();
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([
                    `/`,
                    `/index.html`,
                    `/manifest.json`,
                    `/restaurant.html`,
                    `/js/main.js`,
                    `/js/restaurant_info.js`,
                    `/css/styles.css`,
                    `/img/1.jpg`,
                    `/img/2.jpg`,
                    `/img/3.jpg`,
                    `/img/4.jpg`,
                    `/img/5.jpg`,
                    `/img/6.jpg`,
                    `/img/7.jpg`,
                    `/img/8.jpg`,
                    `/img/9.jpg`,
                    `/img/10.jpg`
                ])
                .then(() => self.skipWaiting());
        })
    );
});



self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
var handled = false;
    if(event.request.url=='http://localhost:1337/restaurants')
    {
        event.respondWith(
            idb.open('restaurantsDB').then(function(db) {
                var tx = db.transaction('restaurants', 'readonly');
                var store = tx.objectStore('restaurants');
                return store.get('restaurants');
              }).then(function(val) {
                //return val;
                console.log(val);
                handled = true;
                return new Response(JSON.stringify(val),  { "status" : 200 , "statusText" : "MyCustomResponse!" })
              })
        )
        
     }   
     if(handled !=true)
     {     
    event.respondWith(
        caches.open(cacheName)
        .then(cache => cache.match(event.request, { ignoreSearch: true }))
        .then(response => {
            
            return response || fetch(event.request);
        })
    );
   }
});