import { Actor } from './actor';

export interface Scene extends Phaser.Scene {
    bulletColliders?: any;
}

export interface PhysicBody extends Phaser.Physics.Arcade.Sprite {
    alive: boolean;
    onFollowedMove?: (actor: Actor) => void;
    resetState?: () => void;
}

export interface Stats {
    strength: number;
    intelligence: number;
    hp: number;
    mp: number;
    speed: number;
    luck: number;
    attackSpeed: number;
    physicalResistance: number;
    magicResistance: number;
    agility: number;
    attackRange: number;
    accuracy: number;
    weaponMastery: number;
    cooldownSpeed: number;
}

export interface OnAttacked {
    actor: Actor;
    damage: number;
    criticalAttack?: boolean;
    showText?: boolean;
}

export interface BaseActorStatus {
    alive: boolean;
    canMove: boolean;
    canAttack: boolean;
}

export type CollierType = Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[] | Phaser.GameObjects.Group | Phaser.GameObjects.Group[];
