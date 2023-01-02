import { Actor } from './actor';

declare module 'raw-loader!*' {
  const content: string;
  export default content;
}
export interface Scene extends Phaser.Scene {
  bulletColliders?: any;
}

export interface PhysicBody extends Phaser.Physics.Arcade.Sprite {
  alive: boolean;
  onFollowedMove?: (actor: Actor) => void;
  resetState?: () => void;
}

export interface Stats {
  /** @summary Sức mạnh vật lý */
  strength: [number, number];

  /** @summary Sức mạnh pháp thuật */
  intelligence: [number, number];

  /** @summary Sinh lực */
  hp: number;

  /** @summary Ma lực */
  mp: number;

  /** @summary Tốc độ di chuyển */
  speed: number;

  /** @summary May mắn */
  luck: number;

  /** @summary Tốc độ đánh */
  attackSpeed: number;

  /** @summary Kháng sát thương vật lý */
  physicalResistance: number;

  /** @summary Kháng sát thương pháp thuật */
  magicResistance: number;

  /** @summary Nhanh nhẹn */
  agility: number;

  /** @summary Tầm đánh */
  autoAimRange: number;

  /** @summary Chính xác */
  accuracy: number;

  /** @summary Khéo néo */
  dexterity: number;

  /** @summary Giảm tốc độ hồi chiêu % */
  cooldownSpeed_: number;

  /** @summary Thêm sát thương chí mạng % */
  criticalX_: number;
}

export interface OnAttacked {
  actor: Actor;
  state: GetRealDamageState;
}

export interface OnAttackEnemy {
  target: Actor;
  state: GetRealDamageState;
}

export interface BaseActorStatus {
  alive: boolean;
  canMove: boolean;
  canAttack: boolean;
}

export interface RealDamageOptions {
  realDamage: number;
}

export interface GetRealDamageState {
  debugId?: string;
  miss: boolean;
  damage: number;
  isCritical: boolean;
  criticalX: number;
  maxCriticalX: number;
}

export type CollierType =
  | Phaser.GameObjects.GameObject
  | Phaser.GameObjects.GameObject[]
  | Phaser.GameObjects.Group
  | Phaser.GameObjects.Group[];

export type ProactiveObject = Phaser.GameObjects.GameObject & {
  status: {
    alive: boolean;
  };
};
