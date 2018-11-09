#expiring-cache

An expiring cache!

This is an in-memory cache which stores key/value pairs in a collection and invalidates them after a certain period of time. Useful for things that aren't really important enough to stick into a db, want to be kept around, and should not be kept around for the entire lifetime of the app.

The `expiring-cache` defines a particular fetch method which all keys must use, though the key is passed in such that you could make an API call based on the key, etc.

In addition, it requires all items in the cache to have the same maximum lifespan (though of course they expire at different times if they were inserted at different times). If each item in the cache needs its own expiry time, check out `expiring-per-item-cache`

Usage (typescript):

```typescript
import ExpiringCache from 'expiring-cache';

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getSomeNumberValueAsync(key: string) {
    let sum = 0;
    for (let i = 0; i < key.length; ++i) {
        sum += key.charCodeAt(i);
        await pause(Math.random() * 50);
    }
    
    return sum;
}

const expiringCache: ExpiringCache<string, number> = new ExpiringCache<string, number>({
    fetch: (key: string) => getSomeNumberValueAsync(key),
    expireTime: 5*60*1000, // 5 minutes
    clearTime: 2*60*1000 // 2 minutes 
});

async function main() {
    // As expected, if fetch's promise fails then this will also throw
    // Otherwise value is now a number.
    const value = await expiringCache.getEntry('duck');
}
```