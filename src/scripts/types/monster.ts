import BaseMonster from '../entities/monster';
import { BulletOptions } from './bullet';
import { BaseActorStatus, Scene, Stats } from './global';

export interface MonsterStats extends Stats {
  vision: number;
  scale: number;
  movementRound: number;
  maxMovementRound: number;
}

export interface MonsterStatuses extends BaseActorStatus {
  isCanSeeHater: boolean;
}

export interface MonsterBulletOptions extends BulletOptions {
  damage: [number, number];
  damageIcre: number;
}

export type MonsterInstane = { new (scence: Scene, x?: number, y?: number): BaseMonster };
