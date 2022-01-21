import { BaseActorStatus, OnAttacked, OnAttackEnemy, Stats } from './global';

export type DamageType = 'strength' | 'intelligence';
export interface Actor extends Phaser.GameObjects.Sprite {
    _angle?: number;
    direction?: string;
    stats: Stats;
    status: BaseActorStatus;
    onEnemyDie?: () => void;
    onAttacked?: ({ actor, state }: OnAttacked) => void;
    onAttackEnemy?: ({ target, state }: OnAttackEnemy) => void;
    getBasicDamage: () => {
        min: number;
        max: number;
        avg: number;
    };
    getBasicDamageType: () => DamageType;
    getDamageResistance: (type: 'physicalResistance' | 'magicResistance') => number;
}
