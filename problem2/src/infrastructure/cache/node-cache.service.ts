import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';
import { CacheService } from './cache.service';

@Injectable()
export class NodeCacheService extends CacheService {
  private readonly cache = new NodeCache({ stdTTL: 600, maxKeys: 1000 });

  get<T>(key: string): Promise<T | undefined> {
    return Promise.resolve(this.cache.get<T>(key));
  }

  set<T>(key: string, value: T): Promise<void> {
    return Promise.resolve(void this.cache.set(key, value));
  }
}
