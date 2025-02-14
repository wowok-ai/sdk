
import { Protocol } from "./protocol";

export abstract class CacheData {
    constructor(expire: number) { this.expire = expire; } // 10m default
    abstract load(key: string) : string | null | undefined;
    abstract save(key: string, data:string) : void;
    expire_time() {return this.expire};
    protected expire;
}

export const OBJECT_KEY = (object: string) : string => {
    return object + Protocol.Instance().package('wowok_origin') + 'V2';
}

export class MemeryCache extends CacheData {
    constructor(expire: number = 10000) {super(expire)}
    protected data = new Map<string, string>;
    load(key: string) : string | null | undefined {
        return this.data.get(key)
    }
    save(key: string, data:string) : void {
        this.data.set(key, data);
    }
}

export class LocalStorageCache extends CacheData {
    constructor(expire: number = 10000) {super(expire)}
    load(key: string) : string | null | undefined {
        return localStorage.getItem(key)
    }
    save(key: string, data:string) : void {
        return localStorage.setItem(key, data)
    }
}

export class WowokCache {
    static _instance: any;
    private cache: any;
    
    constructor() {}
    static Instance() : WowokCache {
        if (!WowokCache._instance) {
            WowokCache._instance = new WowokCache();
        }; return WowokCache._instance
    }

    set(cache:CacheData) {
        this.cache = cache;
    }
    get() : CacheData {
        return this.cache;
    }
}