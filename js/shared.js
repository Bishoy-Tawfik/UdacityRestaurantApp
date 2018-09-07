function syncData() {
    idbKeyval.keys().then(keys => {
        keys.forEach(element => {
            idbKeyval.get(element).then(val => {
                console.log(val);
                if (val.name) {
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
                } else {
                    fetch('http://localhost:1337/restaurants/' + val.restaurant_id + '/?is_favorite=' + val.checked, {
                        method: 'PUT',
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
                }
            });
        });
    });
    const cacheName = `v1`;
    caches.open(cacheName).then(function(cache) {
        cache.delete('restaurants').then(function(response) {
            console.log('restaurants is deleted!');
        })
    });
    caches.open(cacheName).then(function(cache) {
        cache.delete('reviews').then(function(response) {
            console.log('reviews is deleted!');
        })
    });
}