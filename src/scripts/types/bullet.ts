import { PhysicBody } from './global';

export interface BaseBullet extends PhysicBody {
    attacked: PhysicBody;
    timer: Phaser.Time.TimerEvent;
    collidesTimes?: number;
}

export interface BulletOptions {
    damage: [number, number];
    speed: number;
    attackRange: number;
    width: number;
    height: number;
    scale: number;
    rotation: number;
    center: boolean;
    scaleIncre: number;
    damageIcre: number;
    criticalChane: number;
    criticalX: number;
    deflection: number;
}
