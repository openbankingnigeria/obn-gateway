import { User } from '@common/database/entities';

export class BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User | null,
    public readonly metadata?: any,
  ) {}
}
