import { BaseActorStatus, OnAttacked, Stats } from './global';

export interface Actor extends Phaser.GameObjects.Sprite {
    _angle?: number;
    direction?: string;
    stats: Stats;
    status: BaseActorStatus;
    onEnemyDie?: () => void;
    onAttacked?: ({ actor, damage, criticalAttack }: OnAttacked) => void;
}
