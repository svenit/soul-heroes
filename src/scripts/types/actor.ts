import { BaseActorStatus, OnAttacked, Stats } from './global';

export type DamageType = 'strength' | 'intelligence';
export interface Actor extends Phaser.GameObjects.Sprite {
    _angle?: number;
    direction?: string;
    stats: Stats;
    status: BaseActorStatus;
    onEnemyDie?: () => void;
    onAttacked?: ({ actor, damage, criticalAttack }: OnAttacked) => void;
    getBasicDamage: () => {
        min: number;
        max: number;
        avg: number;
    };
    getBasicDamageType: () => DamageType;
    getDamageResistance: (type: 'physicalResistance' | 'magicResistance') => number;
}
