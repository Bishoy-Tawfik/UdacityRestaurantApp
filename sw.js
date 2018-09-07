const cacheName = `v1`;

self.addEventListener('install', e => {

    fetch('http://localhost:1337/restaurants').then(function(response) {
        var res = response.clone();
        caches.open(cacheName).then(function(cache) {
            cache.add('http://localhost:1337/restaurants', res);
        });
        return response.json();
    }).catch(function(error) {
        console.log('preloading restaurants has failed', error);
    });

    fetch('http://localhost:1337/reviews').then(function(response) {
        var res = response.clone();
        caches.open(cacheName).then(function(cache) {
            cache.add('http://localhost:1337/reviews', res);
        });
        return response.json();
    }).catch(function(error) {
        console.log('preloading reviews has failed', error);
    });

    const timeStamp = Date.now();
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([
                    `/index.html`,
                    `/manifest.json`,
                    `/restaurant.html`,
                    `/js/main.js`,
                    `/js/restaurant_info.js`,
                    `/js/dbhelper.js`,
                    `/js/shared.js`,
                    `/node_modules/idb/lib/idb.js`,
                    `/node_modules/idb-keyval/dist/idb-keyval-iife.min.js`,
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
                    `/img/10.webp`,
                    `/img/placeholder-image.jpg`,
                    `/js/jquery-1.10.2.js`
                ])
                .then(() => self.skipWaiting());
        })
    );
});


self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
    if (navigator.onLine == true) {
        event.respondWith(
            fetch(event.request).then(function(networkResponse) {
                var newResp = networkResponse.clone();
                if (event.request.method == "GET") {
                    caches.open(cacheName).then(function(cache) {
                        cache.put(event.request, newResp).catch(function() {
                            console.log('Could not cache ' + event.request);
                        });
                    });
                }
                return networkResponse;
            }).catch(err => {
                caches.open(cacheName).then(function(cache) {
                    return cache.match(event.request, { ignoreSearch: true }).then(function(response) {
                        return response
                    });
                })
            })


            // caches.open(cacheName).then(function(cache) {
            //     return cache.match(event.request, { ignoreSearch: true }).then(function(response) {
            //         return response || fetch(event.request).then(function(response) {
            //             if (event.request.method == "GET" && event.request.url) {
            //                 cache.add(event.request, response.clone()).catch(function() {
            //                     console.log('Could not cache ' + event.request);
            //                 });
            //             }
            //         }).catch(function(err) {
            //             console.log('offline!');
            //         });
            //     }).catch(function(err) {
            //         console.log('offline!');
            //     });
            // })
        );
    } else {
        event.respondWith(
            caches.open(cacheName).then(function(cache) {
                return cache.match(event.request, { ignoreSearch: true }).then(function(response) {
                    return response || fetch(event.request).then(function(response) {
                        if (event.request.method == "GET") {
                            cache.put(event.request, response.clone()).catch(function() {
                                console.log('Could not cache ' + event.request);
                            });
                        }
                        return response;
                    });
                });
            })
        )
    }
});