import Collection from '@arcticzeroo/collection';
export default class ExpiringCache<TKey, TValue> extends Collection<TKey, TValue> {
    readonly expireTime: number;
    readonly fetch: (TKey: any) => Promise<TValue>;
    private _timer;
    private _clearInterval;
    /**
     * An expiring cache!
     * <p>
     * This cache is an in-memory cache that allows you to
     * store and manage key/value-based data that doesn't
     * need to be updated in real-time.
     * <p>
     * By default, this cache considers an item as valid for
     * 12 hours, and every 6 hours it clears out invalid entries.
     * <p>
     * You must provide it a function (async will usually be the
     * case here, else you probably wouldn't need this cache) in
     * order to update invalidated/missing entries.
     * @param {function} fetch - A function to use to grab data when no valid entry for the given key is present. It should take the key as a parameter.
     * @param {number} [expireTime = 12 Hours] - The amount of time it takes for a cache entry to expire. Defaults to 12 hours.
     * @param {number} [clearTime = 6 Hours] - How long the interval between clearing out invalid cache entries should be.
     * @param {...*} d - Additional params to pass to the Collection constructor.
     */
    constructor(fetch: (TKey: any) => Promise<TValue>, expireTime?: number, clearTime?: number, ...d: any[]);
    /**
     * Get an entry, whether or not one currently exists in cache.
     * <p>
     * This is named differently from Collection.get because it is
     * async, which would probably break some stuff Collection does.
     * @param {*} key - The key to get.
     * @return {*}
     */
    getEntry(key: TKey): Promise<TValue>;
    /**
     * Find out whether this collection has a valid entry for a
     * given key. An entry is valid if it exists and the amount
     * of time since it has been added is less or equal to than
     * the cache expiry time.
     * <p>
     * This is named differently from .has in case it produces
     * unexpected issues/performance concerns, especially with
     * Collection.equals(collection).
     * @param {*} key - The key to search for.
     * @return {boolean}
     */
    hasValid(key: TKey): boolean;
    /**
     * Set a key to a particular value. This also updates the
     * time that this key was added to the collection, so don't
     * worry about having to manage that.
     * <p>
     * The return value is that of the collection's .set
     * @param {*} key - A key to set.
     * @param {*} val - A value to set it to.
     * @return {*}
     */
    set(key: TKey, val: TValue): this;
}
