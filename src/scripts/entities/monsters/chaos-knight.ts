import GameHelper from '../../helpers/game';
import { Scene } from '../../types/global';
import { MonsterBulletOptions, MonsterStats } from '../../types/monster';
import Bullet from '../bullet';
import BaseMonster from '../monster';

class ChaosKnight extends BaseMonster {
  /* Private */
  private _stats: Partial<MonsterStats> = {
    hp: 1000,
    mp: 0,
    speed: 0.8,
    vision: 300,
    scale: 1.5,
    autoAimRange: 0,
    movementRound: 2,
    maxMovementRound: 2,
  };
  private _bulletOptions: Partial<MonsterBulletOptions> = {
    damage: [50, 100],
    speed: 2.3,
    scale: 2,
    height: 8,
    width: 8,
    center: true,
    range: 50,
  };

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.setDepth(3);
    this.setBodySize(22, 22, true);
    this.setStats(this._stats);
    this.setScale(this.stats.scale);
  }
  public async makeMonster() {
    super.makeMonster();
    await this._makeAnimations();
    this._attack();
    this.autoMoveToHaterAndAttack();
    this.play('chaos-knight-move');
  }
  private async _makeAnimations() {
    await GameHelper.loadSprite('multiatlas', 'chaos-knight', 'images/monster/chaos-knight/base.json', this.scene);
    this.scene.anims.create({
      key: 'chaos-knight-move',
      frames: GameHelper.convertAnimations(this.scene, 'chaos-knight', 'move'),
      frameRate: 15,
      repeat: Phaser.FOREVER,
    });
  }
  public _attack() {
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, (object: Phaser.Animations.Animation, event: Phaser.Animations.AnimationFrame) => {
      if (event.isLast && object.key == 'chaos-knight-move' && this.status.canAttack) {
        const bullet = new Bullet(this.scene, this.x, this.y, null, this._bulletOptions);
        const bulletObjectOptions = {
          angle: this.moveAngle,
          x: this.x,
          y: this.y,
        } as Phaser.GameObjects.Sprite;
        bullet.makeBulletAnimation(async (bulletScope: Bullet) => {
          await GameHelper.loadSprite('multiatlas', 'chaos-knight', 'images/monster/chaos-knight/base.json', bulletScope.scene);
          bulletScope.scene.anims.create({
            key: 'chaos-knight-attack',
            frames: GameHelper.convertAnimations(bulletScope.scene, 'chaos-knight', 'attack'),
            frameRate: 13,
            repeat: 1,
          });
          bulletScope.bulletAnimation = 'chaos-knight-attack';
          bulletScope.fire(this, bulletObjectOptions, this.haters);
        });
      }
    });
  }
}

export default ChaosKnight;
