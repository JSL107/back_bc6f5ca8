import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheService } from './cache/cache.service';
import { NodeCacheService } from './cache/node-cache.service';
import { NeisClient } from './neis/neis.client';
import { NeisRepository } from './neis/neis.repository';
import { NeisRepositoryImpl } from './neis/neis.repository.impl';

@Module({
  imports: [HttpModule],
  providers: [
    NeisClient,
    { provide: NeisRepository, useClass: NeisRepositoryImpl },
    { provide: CacheService, useClass: NodeCacheService },
  ],
  exports: [NeisRepository, CacheService],
})
export class InfrastructureModule {}
