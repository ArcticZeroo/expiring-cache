import Collection from '@arcticzeroo/collection';
import Duration, { DurationOrMilliseconds } from '@arcticzeroo/duration';

type FetchAsync<K, V> = (key: K) => Promise<V>;

export default class ExpiringCache<K, V> {
    public readonly expireTime: Duration;
    public readonly fetch: FetchAsync<K, V>;
    private readonly _data: Collection<K, V>;
    private _timer: Collection<K, number>;
    private _clearInterval: NodeJS.Timeout;

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
     */
    constructor(fetch: FetchAsync<K, V>, expireTime: DurationOrMilliseconds = new Duration({ hours: 12 }), clearTime: DurationOrMilliseconds = new Duration({ hours: 6 })) {
        /**
         * The amount of time it takes for a cache entry to expire.
         * @type {number}
         */
        this.expireTime = Duration.fromDurationOrMilliseconds(expireTime);

        /**
         * A function to get a new entry when no valid entry for the given key is present.
         * @type {Function}
         */
        this.fetch = fetch;

        /**
         * A timer to track the insert time of each item.
         * @type {Collection}
         * @private
         */
        this._timer = new Collection();

        this._data = new Collection<K, V>();

        this._clearInterval = setInterval(() => {
            for (const key of this._data.keys()) {
                if (!this.has(key)) {
                    this._data.delete(key);
                    this._timer.delete(key);
                }
            }
        }, Duration.fromDurationOrMilliseconds(clearTime).inMilliseconds);
    }

    /**
     * Get an entry, whether or not one currently exists in cache.
     * <p>
     * This is named differently from Collection.get because it is
     * async, which would probably break some stuff Collection does.
     * @param {*} key - The key to get.
     * @return {*}
     */
    async getEntry(key: K): Promise<V | undefined> {
        return this.get(key);
    }

    /**
     * Get an entry, whether or not it exists in the cache. If it does
     * not exist in the cache, fetch will be called.
     * @param key - The key to get
     */
    async get(key: K): Promise<V | undefined> {
        if (this.has(key)) {
            return this._data.get(key);
        }

        try {
            const val = await this.fetch(key);

            this.set(key, val);

            return val;
        } catch (e) {
            throw e;
        }
    }

    hasValid(key: K): boolean {
        return this.has(key);
    }

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
    has(key: K): boolean {
        if (!this._timer.has(key)) {
            return false;
        }

        const value = this._data.get(key);
        const time = this._timer.get(key);

        return value != null && time != null && (Date.now() - time <= this.expireTime.inMilliseconds);
    }

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
    set(key: K, val: V): this {
        this._timer.set(key, Date.now());

        this._data.set(key, val);
        return this;
    }
}