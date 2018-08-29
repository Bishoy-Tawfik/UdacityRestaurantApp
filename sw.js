if (typeof idb === "undefined") {
    self.importScripts('./node_modules/idb/lib/idb.js');
}
const cacheName = `v1`;

self.addEventListener('install', e => {
//     var dbPromise = idb.open("myDB",1);
//        dbPromise.createObjectStore("firstOS");
//         var transaction = dbPromise.transaction(["people"],"readwrite");
//         var store = transaction.objectStore("people");
//         //Define a person
// var person = {
//     name:name,
//     email:email,
//     created:new Date()
// }
 
// //Perform the add
// var request = store.add(person,1);





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
    var dbPromise = idb.open('restaurantsDB', 1, function(upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains('restaurants')) {
          var restaurantsOS = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        }
      });
    event.respondWith(
        caches.open(cacheName)
        .then(cache => cache.match(event.request, { ignoreSearch: true }))
        .then(response => {
            return response || fetch(event.request);
        })
    );
});