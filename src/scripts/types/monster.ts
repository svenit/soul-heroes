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
