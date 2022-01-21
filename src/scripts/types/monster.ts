import { BulletOptions } from './bullet';
import { BaseActorStatus, Stats } from './global';

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
