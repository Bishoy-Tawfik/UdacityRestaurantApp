self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '/index.html',
                '/restaurant.html',
                '/img/1.jpg',
                '/img/2.jpg',
                '/img/3.jpg',
                '/img/4.jpg',
                '/img/5.jpg',
                '/img/6.jpg',
                '/img/7.jpg',
                '/img/8.jpg',
                '/img/9.jpg',
                '/img/10.jpg'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log('I\'m fetch');
    event.respondWith(
        caches.match(event.request).then(function(resp) {
            return resp || fetch(event.request).then(function(response) {
                let responseClone = response.clone();
                caches.open('v1').then(function(cache) {
                    cache.put(event.request, responseClone);
                });

                return response;
            });
        }).catch(function() {
            return caches.match('/img/1.jpg');
        })
    );
});