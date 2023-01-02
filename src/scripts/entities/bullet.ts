import Direction from '../config/direction';
import Groups from '../config/groups';
import GameHelper from '../helpers/game';
import { Actor } from '../types/actor';
import { BaseBullet, BulletOptions } from '../types/bullet';
import { BaseActorStatus, CollierType, Scene } from '../types/global';
import { MonsterBulletOptions } from '../types/monster';

class Bullet extends Phaser.Physics.Arcade.Sprite implements BaseBullet {
  public status: BaseActorStatus = {
    alive: true,
    canMove: true,
    canAttack: true,
  };
  public options: BulletOptions & MonsterBulletOptions = {
    damage: [1, 1],
    speed: 1,
    range: 1,
    width: 1,
    height: 1,
    scale: 1,
    rotation: 0,
    center: false,
    scaleIncre: 0,
    damageIcre: 0,
    criticalX: 2,
    deflection: 0,
    through: 0,
  };
  public bulletAnimation: string = '';
  public attacked: Actor[] = [];

  /* Private */
  private _timer: Phaser.Time.TimerEvent;
  private _passedThrough: number = 0;

  constructor(scene: Scene, x: number, y: number, texture: string | string[] | null, options: Partial<BulletOptions> = {}) {
    // @ts-ignore
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (texture) {
      const [altas, name] = texture;
      Array.isArray(texture) ? this.setTexture(altas, name) : this.setTexture(name);
    }
    this.setImmovable();
    this.name = Groups.Bullet;
    this.options = Object.assign(this.options, options);
  }
  timer: Phaser.Time.TimerEvent;
  collidesTimes?: number | undefined;
  alive: boolean;
  onFollowedMove?: ((actor: Actor) => void) | undefined;
  resetState?: (() => void) | undefined;
  public makeBulletAnimation(callback: CallableFunction) {
    callback(this);
  }
  public fire(
    actor: Actor,
    weapon: Phaser.GameObjects.Sprite,
    targets: Phaser.GameObjects.GameObject[] = [],
    callbackOnColliderGround?: CallableFunction | null,
  ) {
    this.bulletAnimation && this.play(this.bulletAnimation);
    let { range, width, height, speed, scale, rotation, damage, center, scaleIncre, damageIcre, deflection, through } = this.options;
    let criticalAttack = false;
    const { dexterity } = actor.stats;
    /* Sát thương gây ra từ đạn */
    const [minDamage, maxDamage] = damage;
    let realDamage = GameHelper.randomInRange(minDamage, maxDamage);
    /* Độ lệch đạn */
    deflection = deflection - dexterity < 0 ? 0 : deflection - dexterity;
    const randomDeflection = GameHelper.randomInRange(-deflection, deflection);
    /* Chỉnh physic cho đạn */
    const freezeWeapon = Object.assign({}, weapon);
    this.angle = weapon.angle + randomDeflection;
    const direction = GameHelper.getDirectionFromAngle(this.angle);
    if ([Direction.BOTTOM, Direction.TOP].includes(direction)) {
      this.setOrigin(0.5, 0.5);
      [width, height] = [height, width];
    }
    this.setScale(scale);
    this.setBodySize(width, height, center);
    /* Set collider cho bullet */
    // @ts-ignore
    this.scene.physics.add.collider(this, this.scene.bulletColliders, (bullet: CollierType, target: CollierType) => {
      if (callbackOnColliderGround) return callbackOnColliderGround(bullet, target);
      this.destroy();
    });
    /* Di chuyển đạn theo hướng của actor */
    GameHelper.moveByAngle(this, weapon.angle + randomDeflection, speed);
    // @ts-ignore
    this.scene.physics.add.overlap(this, targets, (bullet: Bullet, target: Actor) => {
      /* Nếu đã attack đối tượng trước đó thì không attack lại nữa */
      if (!bullet.attacked.includes(target)) {
        GameHelper.getRealDamage(this.scene, actor, target, {
          realDamage,
        });
        bullet.attacked.push(target);
        /* Check số lượt xuyên táo của đạn */
        this._passedThrough++;
        if (this._passedThrough >= through) {
          bullet.destroy();
          this._timer && this._timer.remove();
          return;
        }
        setTimeout(() => {
          bullet.attacked = bullet.attacked.filter((attacked) => attacked != target);
        }, 500);
      }
    });
    /* Nếu khoảng cách viên đạn vượt quá attackRange thì destroy */
    this._timer = this.scene.time.addEvent({
      delay: 10,
      callback: () => {
        const { distance } = GameHelper.getDistance(freezeWeapon, this);
        this.rotation += rotation;
        this.scale += scaleIncre;
        realDamage += damageIcre;
        if (distance > range) {
          this.destroy();
          this._timer && this._timer.remove();
        }
      },
      callbackScope: this,
      loop: true,
    });
  }
}

export default Bullet;
