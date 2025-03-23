class RateLimit {
    constructor(windowMs = 60000, max = 5) {
        this.windowMs = windowMs;
        this.max = max;
        this.cache = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), windowMs);
    }

    check(key) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        if (!this.cache.has(key)) {
            this.cache.set(key, [now]);
            return true;
        }

        const timestamps = this.cache.get(key).filter(ts => ts > windowStart);
        timestamps.push(now);
        this.cache.set(key, timestamps);

        return timestamps.length <= this.max;
    }

    clear(key) {
        this.cache.delete(key);
    }

    cleanup() {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        this.cache.forEach((timestamps, key) => {
            const validTimestamps = timestamps.filter(ts => ts > windowStart);
            if (validTimestamps.length === 0) {
                this.cache.delete(key);
            } else {
                this.cache.set(key, validTimestamps);
            }
        });
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

export default new RateLimit();