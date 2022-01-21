import GameHelper from '../../helpers/game';
import { Actor } from '../../types/actor';
import { BaseBullet } from '../../types/bullet';
import { CollierType, Scene } from '../../types/global';
import { MonsterBulletOptions, MonsterStats } from '../../types/monster';
import Bullet from '../bullet';
import BaseMonster from '../monster';

class Boomer extends BaseMonster {
    /* Private */
    private _stats: Partial<MonsterStats> = {
        hp: 1000,
        mp: 0,
        speed: 0.5,
        vision: 300,
        scale: 1.5,
        autoAimRange: 300,
        movementRound: 2,
        maxMovementRound: 2,
    };
    private _bulletOptions: Partial<MonsterBulletOptions> = {
        damage: [10, 50],
        speed: 2.3,
        scale: 1.5,
        height: 20,
        width: 20,
        center: true,
        range: 900,
        rotation: 0.1,
    };
    private _coolDownRemaining = 0;
    private _coolDown = 2000;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);
        this.setDepth(3);
        this.setBodySize(22, 22, true);
        this.body.setOffset(0, 12);
        this.setStats(this._stats);
        this.setScale(this.stats.scale);
    }
    public async makeMonster() {
        super.makeMonster();
        await this._makeAnimations();
        this.autoMoveToHaterAndAttack(() => {
            this.play('boomer-move');
        });
        this.play('boomer-move');
    }
    public attack(_hater: Actor, angle: number) {
        if (this._coolDownRemaining == 0 && this.status.alive) {
            this.play('boomer-attack');
            const bullet = new Bullet(this.scene, this.x, this.y, ['boomer', 'bullet.png'], this._bulletOptions);
            const bulletObjectOptions = { angle, x: this.x, y: this.y } as Phaser.GameObjects.Sprite;
            bullet.fire(
                this,
                bulletObjectOptions,
                this.haters,
                (hater: Actor) => this._onAttackHater(hater),
                (bullet: CollierType & BaseBullet, _ground: CollierType) => this._onBulletColliderOnGround(bullet),
            );
            this._coolDownRemaining = this._coolDown;
            setTimeout(() => {
                this._coolDownRemaining = 0;
            }, this._coolDown);
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
            this._onAttackHater(bullet);
            bullet.destroy();
        }
    }
    private _onAttackHater(hater: Actor | (CollierType & BaseBullet)) {
        if (this.status.alive) {
            const boom = this.scene.add.sprite(hater.x, hater.y, '');
            boom.setScale(1.3);
            boom.play('boomer-bang');
            boom.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => boom.destroy());
        }
    }
    private async _makeAnimations() {
        await GameHelper.loadSprite('multiatlas', 'boomer', 'images/monster/boomer/base.json', this.scene);
        this.scene.anims.create({
            key: 'boomer-move',
            frames: GameHelper.convertAnimations(this.scene, 'boomer', 'move'),
            frameRate: 8,
            repeat: Phaser.FOREVER,
        });
        this.scene.anims.create({
            key: 'boomer-attack',
            frames: GameHelper.convertAnimations(this.scene, 'boomer', 'attack'),
            frameRate: 10,
            repeat: 5,
        });
        this.scene.anims.create({
            key: 'boomer-bang',
            frames: GameHelper.convertAnimations(this.scene, 'boomer', 'bang'),
            frameRate: 15,
            repeat: 0,
        });
    }
}

export default Boomer;
