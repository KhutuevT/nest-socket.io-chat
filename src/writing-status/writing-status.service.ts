import { createClient } from 'redis';
import { Injectable } from '@nestjs/common';

const redis = createClient();
redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();

@Injectable()
export class WritingStatusService {
  async create(id: string) {
    redis.set(id,'writing');
    return `writing status for user ${id} successful added`;
  }

  async findAll() {
    const onlineUsers = await redis.keys('*');
    return onlineUsers;
  }

  async remove(id: string) {
    redis.del(id);
    return `writing status for user ${id} removed`;
  }
}
