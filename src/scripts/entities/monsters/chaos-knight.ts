import GameHelper from '../../helpers/game';
import { Actor } from '../../types/actor';
import { BulletOptions } from '../../types/bullet';
import { Scene } from '../../types/global';
import { MonsterStats } from '../../types/monster';
import Bullet from '../bullet';
import BaseMonster from '../monster';

class ChaosKnight extends BaseMonster {
    /* Private */
    private _bulletOptions: Partial<BulletOptions> = {
        damage: [50, 100],
        speed: 2.3,
        scale: 1.5,
        height: 8,
        width: 8,
        center: true,
        attackRange: 50,
    };
    private _stats: Partial<MonsterStats> = {
        hp: 1000,
        mp: 0,
        speed: 0.5,
        vision: 300,
        scale: 1.5,
        attackRange: 0,
        movementRound: 2,
        maxMovementRound: 2,
    };
    private _waves: { [id: string]: Phaser.Physics.Arcade.Sprite } = {};

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
            frameRate: 8,
            repeat: Phaser.FOREVER,
        });
        this.scene.anims.create({
            key: 'chaos-knight-attack',
            frames: GameHelper.convertAnimations(this.scene, 'chaos-knight', 'attack'),
            frameRate: 20,
            repeat: 1,
        });
    }
    public _attack() {
        this.on(Phaser.Animations.Events.ANIMATION_UPDATE, (object: Phaser.Animations.Animation, event: Phaser.Animations.AnimationFrame) => {
            if (event.isLast && object.key == 'chaos-knight-move' && this.status.canAttack) {
                this.status.canAttack = false;
                const id = GameHelper.uuid();

                this._waves[id] = this.scene.physics.add.sprite(this.x, this.y, '');
                this._waves[id].setBodySize(22, 22);
                this._waves[id].setFlipX(this.flipX);
                this._waves[id].setPosition(this.flipX ? this.x - 40 : this.x + 40, this.y);
                this._waves[id].setScale(2);
                this._waves[id].setOrigin(0.5, 0.5);
                this._waves[id].setImmovable();
                this._waves[id].play('chaos-knight-attack');

                this._waves[id].on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    this.status.canAttack = true;
                    this._waves[id].destroy();
                });

                const bullet = new Bullet(this.scene, this.x, this.y, null, this._bulletOptions);
                const bulletObjectOptions = {
                    angle: 1,
                    x: this.x,
                    y: this.y,
                } as Phaser.GameObjects.Sprite;
                bullet.fire(this, bulletObjectOptions, this.haters);
            }
        });
    }
}

export default ChaosKnight;
