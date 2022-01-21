import { Actor } from './actor';
import { PhysicBody } from './global';

export interface BaseBullet extends PhysicBody {
    attacked: Actor[];
    timer: Phaser.Time.TimerEvent;
    collidesTimes?: number;
}

export interface BulletOptions {
    speed: number;
    range: number;
    width: number;
    height: number;
    scale: number;
    rotation: number;
    center: boolean;
    scaleIncre: number;
    criticalX: number;
    deflection: number;
    through: number;
}
