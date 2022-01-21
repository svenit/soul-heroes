import GameHelper from '../../helpers/game';
import { Actor } from '../../types/actor';
import { Scene } from '../../types/global';
import { MonsterBulletOptions, MonsterStats } from '../../types/monster';
import Bullet from '../bullet';
import BaseMonster from '../monster';

class Pantheon extends BaseMonster {
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
        damage: [50, 100],
        speed: 2.3,
        scale: 1.5,
        height: 8,
        width: 8,
        center: true,
        range: 900,
    };
    private _coolDownRemaining = 0;
    private _coolDown = 2000;

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
        this.autoMoveToHaterAndAttack(() => {
            this.play('pantheon-move');
        });
        this.play('pantheon-move');
    }
    public attack(_hater: Actor, angle: number) {
        if (this._coolDownRemaining == 0) {
            this.play('pantheon-attack');
            const bullet = new Bullet(this.scene, this.x, this.y, ['pantheon', 'bullet.png'], this._bulletOptions);
            const bulletObjectOptions = {
                angle,
                x: this.x,
                y: this.y,
            } as Phaser.GameObjects.Sprite;
            bullet.fire(this, bulletObjectOptions, this.haters);
            this._coolDownRemaining = this._coolDown;
            setTimeout(() => {
                this._coolDownRemaining = 0;
            }, this._coolDown);
        }
    }
    private async _makeAnimations() {
        await GameHelper.loadSprite('multiatlas', 'pantheon', 'images/monster/pantheon/base.json', this.scene);
        this.scene.anims.create({
            key: 'pantheon-move',
            frames: GameHelper.convertAnimations(this.scene, 'pantheon', 'move'),
            frameRate: 8,
            repeat: Phaser.FOREVER,
        });
        this.scene.anims.create({
            key: 'pantheon-attack',
            frames: GameHelper.convertAnimations(this.scene, 'pantheon', 'attack'),
            frameRate: 10,
            repeat: 5,
        });
    }
}

export default Pantheon;
