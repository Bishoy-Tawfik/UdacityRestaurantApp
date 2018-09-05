if (typeof idb === "undefined") {
    self.importScripts('./node_modules/idb/lib/idb.js');
}
if (typeof idbKeyval === "undefined") {
    self.importScripts('./node_modules/idb-keyval/dist/idb-keyval-iife.min.js');
}


function SyncReviews() {
    //Check if the server is online:
    fetch('http://localhost:1337/restaurants/?is_favorite=true').then(function(response) {
        return response;
    }).then(function(text) {
        console.log('Request successful', text);
    }).catch(function(error) {
        console.log('Request failed', error);
    });

    idbKeyval.keys().then(keys => {
        keys.forEach(element => {
            idbKeyval.get(element).then(val => {
                console.log(val);
                var querystring = '?restaurant_id=' + val.restaurant_id + '&name=' + val.name + '&rating=' + val.rating + '&comments=' + val.comments;
                console.log(querystring);
                fetch('http://localhost:1337/reviews/' + querystring, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(res => {
                    console.log('The comment was submitted correctly!');
                    idbKeyval.del(element);
                    return res;

                }).catch(function(err) {
                    return err;
                });
            });
        });
    });
}


const cacheName = `v1`;

self.addEventListener('install', e => {

    fetch('http://localhost:1337/restaurants').then(function(response) {
        return response.json();
    }).then(function(data) {
        var dbPromise = idb.open('restaurantsDB', 1, function(upgradeDb) {
            if (!upgradeDb.objectStoreNames.contains('restaurants')) {
                var restaurantsOS = upgradeDb.createObjectStore('restaurants');
                restaurantsOS.put(data, 'restaurants');
            }
        });
    }).catch(function(error) {
        console.log('Request failed', error);
    });

    fetch('http://localhost:1337/reviews').then(function(response) {
        return response.json();
    }).then(function(data) {
        var dbReviewsPromise = idb.open('reviewsDB', 1, function(upgradeDb) {
            if (!upgradeDb.objectStoreNames.contains('reviews')) {
                var reviewsOS = upgradeDb.createObjectStore('reviews');
                reviewsOS.put(data, 'reviews');
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
                    `/review.html`,
                    `/js/main.js`,
                    `/js/restaurant_info.js`,
                    `/js/dbhelper.js`,
                    `js/URI.min.js`,
                    `./node_modules/idb/lib/idb.js`,
                    `./node_modules/idb-keyval/dist/idb-keyval-iife.min.js`,
                    `/css/styles.css`,
                    `/css/styles-med.css`,
                    `/css/styles-small.css`,
                    `/img/1.webp`,
                    `/img/2.webp`,
                    `/img/3.webp`,
                    `/img/4.webp`,
                    `/img/5.webp`,
                    `/img/6.webp`,
                    `/img/7.webp`,
                    `/img/8.webp`,
                    `/img/9.webp`,
                    `/img/10.webp`
                ])
                .then(() => self.skipWaiting());
        })
    );
});


addEventListener('sync', function(event) {
    if (event.tag === 'add-review') {
        event.waitUntil(SyncReviews());

    }
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    var handled = false;
    if (event.request.url == 'http://localhost:1337/restaurants') {
        event.respondWith(
            idb.open('restaurantsDB').then(function(db) {
                var tx = db.transaction('restaurants', 'readonly');
                var store = tx.objectStore('restaurants');
                return store.get('restaurants');
            }).then(function(val) {
                //return val;
                console.log(val);
                handled = true;
                return new Response(JSON.stringify(val), { "status": 200, "statusText": "MyCustomResponse!" })
            })
        )

    }
    if (event.request.method == 'GET' && event.request.url == 'http://localhost:1337/reviews') {
        event.respondWith(
            idb.open('reviewsDB').then(function(db) {
                var tx = db.transaction('reviews', 'readonly');
                var store = tx.objectStore('reviews');
                return store.get('reviews');
            }).then(function(val) {
                //return val;
                console.log(val);
                handled = true;
                return new Response(JSON.stringify(val), { "status": 200, "statusText": "MyCustomResponse!" })
            })
        )

    }

    if (handled != true) {
        event.respondWith(
            caches.open(cacheName)
            .then(cache => cache.match(event.request, { ignoreSearch: true }))
            .then(response => {

                return response || fetch(event.request);
            })
        );
    }
});