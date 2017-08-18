#expiring-cache

An expiring cache!

This cache is an in-memory cache that allows you to store and manage key/value-based data that doesn't need to be updated in real-time.

It is built upon Discord.JS Collections, which extend `Map` with some useful features and optimizations.

By default, this cache considers an item as valid for 12 hours, and every 6 hours it clears out invalid entries. 
 
You must provide it a function (async will usually be the case here, else you probably wouldn't need this cache) in order to update invalidated/missing entries.

Check ExpiringCache.js for some JSDocs.