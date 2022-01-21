import GameHelper from '../../helpers/game';
import SoundManager from '../../managers/sound';
import { Actor, DamageType } from '../../types/actor';
import { BaseBullet } from '../../types/bullet';
import { CollierType, OnAttackEnemy, Scene } from '../../types/global';
import { MonsterBulletOptions, MonsterStats } from '../../types/monster';
import Bullet from '../bullet';
import BaseMonster from '../monster';

class IceBear extends BaseMonster {
    /* Private */
    private _stats: Partial<MonsterStats> = {
        hp: 1000,
        mp: 0,
        strength: [60, 80],
        intelligence: [60, 80],
        speed: 0.5,
        vision: 600,
        scale: 2,
        agility: 150,
        accuracy: 100,
        autoAimRange: 300,
        movementRound: 2,
        maxMovementRound: 2,
        luck: 2,
        criticalX_: 20,
    };
    private _bulletOptions: Partial<MonsterBulletOptions> = {
        damage: [60, 70],
        speed: 2.3,
        scale: 2,
        height: 15,
        width: 15,
        center: true,
        range: 900,
        rotation: 0.2,
        scaleIncre: 0.01,
        damageIcre: 1,
        through: 0,
    };
    private _coolDownRemaining = 0;
    private _coolDown = 2000;
    private _freezeHaterTimer: Phaser.Time.TimerEvent;
    private _freezeAnimation: Phaser.GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);
        this.setDepth(3);
        this.setBodySize(40, 36, true);
        this.setOffset(6, 6);
        this.setStats(this._stats);
        this.setScale(this.stats.scale);
    }
    public async makeMonster() {
        super.makeMonster();
        await this._makeAnimations();
        this.autoMoveToHaterAndAttack(() => {
            this.play('ice-bear-move');
        });
        this.play('ice-bear-move');
    }
    public getBasicDamageType(): DamageType {
        return 'intelligence';
    }
    public attack(_hater: Actor, angle: number) {
        if (this._coolDownRemaining == 0 && this.status.alive) {
            this.status.canMove = false;
            this.stop();
            this.setTexture('ice-bear', 'attack_2');
            setTimeout(() => {
                this._fire(angle);
                this.status.canMove = true;
                this._coolDownRemaining = this._coolDown;
                setTimeout(() => {
                    this.status.alive && (this._coolDownRemaining = 0);
                }, this._coolDown);
            }, 200);
        }
    }
    private _fire(angle: number) {
        for (let i = 0; i < 3; ++i) {
            const bullet = new Bullet(this.scene, this.x, this.y, ['ice-bear', 'bullet.png'], this._bulletOptions);
            const bulletObjectOptions = {
                angle: angle + (i - 1) * 10,
                x: this.x,
                y: this.y,
            } as Phaser.GameObjects.Sprite;
            bullet.fire(this, bulletObjectOptions, this.haters, this._onBulletColliderOnGround);
        }
    }
    private _onBulletColliderOnGround(bullet: CollierType & BaseBullet) {
        if (!bullet.collidesTimes) {
            // @ts-ignore
            bullet.body.setVelocity(200, 200).setBounce(1, 1);
            return (bullet.collidesTimes = 1);
        }
        bullet.collidesTimes++;
        if (bullet.collidesTimes == 3) {
            bullet.destroy();
        }
    }
    public onAttackEnemy({ target }: OnAttackEnemy) {
        if (this.status.alive) {
            const randomFreezeChane = GameHelper.randomInRange(0, 100);
            /* 30% làm đóng băng hater */
            if (randomFreezeChane <= 30) {
                if (this._freezeAnimation) this._freezeAnimation.destroy();
                target.status.canMove = false;
                target.status.canAttack = false;
                SoundManager.play('ice', this.scene, {
                    volume: 0.1,
                });
                this._freezeAnimation = this.scene.add.sprite(target.x, target.y, '');
                this._freezeAnimation.setScale(1.7).setDepth(5).setOrigin(0.5, 0.5);
                this._freezeAnimation.play('freeze-effect');
                this._freezeHaterTimer = this.scene.time.addEvent({
                    delay: 1500,
                    callback: () => {
                        target.status.canMove = true;
                        target.status.canAttack = true;
                        this._freezeAnimation && this._freezeAnimation.destroy();
                        this._freezeHaterTimer && this._freezeHaterTimer.remove();
                    },
                    callbackScope: this,
                    loop: false,
                });
            }
        }
    }
    private async _makeAnimations() {
        await GameHelper.loadSprite('multiatlas', 'ice-bear', 'images/monster/ice-bear/base.json', this.scene);
        await GameHelper.loadSprite('multiatlas', 'freeze', 'images/common/effects/freeze.json', this.scene);
        this.scene.anims.create({
            key: 'ice-bear-move',
            frames: GameHelper.convertAnimations(this.scene, 'ice-bear', 'move'),
            frameRate: 8,
            repeat: Phaser.FOREVER,
        });
        this.scene.anims.create({
            key: 'ice-bear-attack',
            frames: GameHelper.convertAnimations(this.scene, 'ice-bear', 'attack'),
            frameRate: 10,
            repeat: 5,
        });
        this.scene.anims.create({
            key: 'freeze-effect',
            frames: this.scene.anims.generateFrameNames('freeze'),
            frameRate: 10,
            repeat: 5,
        });
    }
}

export default IceBear;
