const fsStore = require('cache-manager-fs');
const requestPlus = require('request-plus');
const cacheManager = require('cache-manager');
const delay = 3000;
const ttl = 48 * 60 * 60; // seconds
const cacheReady = new Promise(
    function (resolve) {
        const cache = cacheManager.caching({
            store: fsStore,
            isCacheableValue: value => value !== undefined,
            options: {
                ttl,
                maxsize: 100e6 /* max size in bytes on disk */,
                fillcallback: () => resolve(cache),
            },
        });
    }
).then(cache => requestPlus({
    cache: {cache},
    retry: {
        attempts: 3,
        delay,
    },
}));

function pause(result) {
    return new Promise(function (resolve) {
        setTimeout(() => resolve(result), delay);
    });
}

module.exports = function (uri, options = {}) {
    if (typeof uri === 'string') {
        options.uri = uri;
    }
    else {
        options = uri;
    }
    if (delay) {
        options.transform = pause;
    }
    return cacheReady.then(rp => rp(options))
        .then(body => body === undefined ? null : body); // avoid undefined (which is uncacheable)
};
