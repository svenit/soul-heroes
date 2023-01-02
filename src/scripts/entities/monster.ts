import Direction from '../config/direction';
import GameConfig from '../config/game';
import Groups from '../config/groups';
import GameHelper from '../helpers/game';
import { Actor, DamageType } from '../types/actor';
import { OnAttacked, OnAttackEnemy, PhysicBody, ProactiveObject, Scene } from '../types/global';
import { MonsterStats, MonsterStatuses } from '../types/monster';
import Bar from './bar';

class BaseMonster extends Phaser.Physics.Arcade.Sprite implements Actor {
  public stats: MonsterStats = {
    hp: 0,
    mp: 0,
    physicalResistance: 0,
    magicResistance: 0,
    luck: 0,
    speed: 1,
    agility: 0,
    vision: 0,
    scale: 1,
    autoAimRange: 0,
    movementRound: 2,
    maxMovementRound: 2,
    strength: [0, 0],
    intelligence: [0, 0],
    attackSpeed: 0,
    accuracy: 0,
    dexterity: 0,
    cooldownSpeed_: 0,
    criticalX_: 0,
  };
  public status: MonsterStatuses = {
    alive: true,
    canAttack: true,
    canMove: true,
    isCanSeeHater: false,
  };
  public drop = {
    xp: [0, 0],
  };
  public bodyContainer: Phaser.GameObjects.Container;
  public hp: Bar;
  public followers: Phaser.GameObjects.GameObject[] = [];
  public haters: ProactiveObject[] = [];
  public haterTypes: string[] = [Groups.Player];
  public closestHater: Actor | null = null;
  public moveAngle: number = 0;

  /* Private */
  private _gfx: Phaser.GameObjects.Graphics;
  private _loopTimer: Phaser.Time.TimerEvent;
  private _moveToHaterTimer: Phaser.Time.TimerEvent;
  private _moveByAITimer: Phaser.Time.TimerEvent;

  constructor(scene: Scene, x: number, y: number) {
    // @ts-ignore
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.name = Groups.Monster;
    this._gfx = this.scene.add.graphics();
    this.setImmovable();
  }
  public makeMonster() {
    this.bodyContainer = this.scene.add.container();
    this.bodyContainer.setPosition(this.x, this.y).setDepth(3).setSize(0.1, 0.1);
    this.scene.physics.world.enable(this.bodyContainer);

    this.hp = new Bar(this.scene, this, {
      total: this.stats.hp,
    });
    this.bodyContainer.add(this.hp);
    /* Lấy ra haters */
    this._loopTimer = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        const { alive, canMove } = this.status;
        if (!alive && this._loopTimer) {
          return this._loopTimer.remove();
        }
        if (!canMove) {
          // @ts-ignore
          this.body.setVelocity(0);
          this.triggerFollowersMove();
        }
        this.bodyContainer.setPosition(this.x, this.y);
        // @ts-ignore
        this.bodyContainer.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
        this.haters = this.scene.children.list.filter((child: Phaser.GameObjects.GameObject) =>
          this.haterTypes.includes(child.name),
        ) as ProactiveObject[];
      },
      callbackScope: this,
      loop: true,
    });
  }
  public setStats(stats: Partial<MonsterStats> = {}) {
    this.stats = Object.assign(this.stats, stats);
  }
  public autoMoveToHaterAndAttack(injectCallback?: CallableFunction) {
    const { alive, canMove } = this.status;
    if (alive && canMove) {
      this.moveByAI();
      this._moveToHaterTimer = this.scene.time.addEvent({
        delay: GameHelper.randomInRange(500, 1000),
        callback: () => {
          if (!this.status.alive && this._moveToHaterTimer) {
            return this._moveToHaterTimer.remove();
          }
          this._gfx.clear();
          if (injectCallback) injectCallback();
          this.closestHater = null;
          this.followHaterAndAttack();
        },
        callbackScope: this,
        loop: true,
      });
      // @ts-ignore
      this.addColliders(this.scene.globalColliders, () => this.moveByAI());
    }
  }
  public followHaterAndAttack() {
    const hatersLive = this.haters.filter((hater) => hater.status.alive);
    this.closestHater = this.scene.physics.closest(this, hatersLive) as Actor;
    if (this.closestHater && this.closestHater.status.alive) {
      const { angle, distance } = GameHelper.getDistance(this, this.closestHater);
      this.status.isCanSeeHater = false;
      if (this.stats.vision && this.stats.vision >= distance) {
        const direction = GameHelper.getDirectionFromAngle(angle);
        const isMoveLeft = [Direction.LEFT, Direction.TOP_LEFT, Direction.BOTTOM_LEFT].includes(direction);
        this.setFlipX(isMoveLeft);
        this.status.isCanSeeHater = true;
        if (GameConfig.showMonterVisionRange) {
          this._gfx.lineStyle(5, 0x5832a8).lineBetween(this.closestHater.x, this.closestHater.y, this.x, this.y);
        }
        if (this.stats.autoAimRange && this.stats.autoAimRange >= distance) {
          this.moveByAI();
          this.setFlipX(isMoveLeft);
          // @ts-ignore
          return this.attack && this.attack(this.closestHater, angle);
        }
        return this.changeDirection(angle, this.stats.speed ?? 0);
      }
    }
    this.moveByAI();
  }
  public autoMoveByAI() {
    if (this.status.alive && this.status.canMove) {
      this.moveByAI();
      this._moveByAITimer = this.scene.time.addEvent({
        delay: GameHelper.randomInRange(500, 2000),
        callback: () => {
          if (!this.status.alive && this._moveByAITimer) this._moveByAITimer.remove();
          this.moveByAI();
        },
        callbackScope: this,
        loop: true,
      });
      // @ts-ignore
      this.addColliders(this.scene.globalColliders, () => this.moveByAI());
    }
  }
  public moveByAI() {
    if (this.status.alive && this.status.canMove) {
      const { speed } = this.stats;
      const angle = GameHelper.randomInRange(-180, 180);
      if (this.stats.maxMovementRound == this.stats.movementRound) {
        this.stats.movementRound = 0;
        this.changeDirection(angle, speed ?? 0);
      }
      // @ts-ignore
      this.stats.movementRound++;
    }
  }
  public changeDirection(angle: number, speed: number) {
    this.moveAngle = angle;
    if (this.status.alive && this.status.canMove) {
      GameHelper.moveByAngle(this, angle, speed, false);
      this.setFlipX(this.body.velocity.x < 0);
      this.triggerFollowersMove();
    }
  }
  public getBasicDamageType(): DamageType {
    return 'strength';
  }
  public getBasicDamage() {
    const [min, max] = this.stats[this.getBasicDamageType()];
    return {
      min,
      max,
      avg: GameHelper.randomInRange(min, max),
    };
  }
  public getDamageResistance(type: string) {
    return this.stats[type];
  }
  public triggerFollowersMove() {
    if (this.status.alive) {
      this.followers.forEach((follower: any) => follower.onFollowedMove && follower.onFollowedMove(this));
    }
  }
  public addColliders(objects: PhysicBody[], callback: ArcadePhysicsCallback) {
    this.scene.physics.add.collider(this, objects, callback);
  }
  public onAttacked({ actor, state }: OnAttacked) {
    const isDied = this.hp && this.hp.decrease(state.damage);
    this.setTint(0xff0000);
    this.scene.time.addEvent({
      delay: 80,
      callback: () => {
        this.clearTint();
      },
      callbackScope: this,
      loop: false,
    });

    if (isDied) {
      this.status.alive = false;
      actor && actor.onEnemyDie && actor.onEnemyDie();
      this.onDie();
    }
  }
  public onDie() {
    this.followers.forEach((follower) => follower.destroy());
    this.bodyContainer.destroy();
    this.destroy();
  }
}

export default BaseMonster;
