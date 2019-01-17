import GameHelper from '../../helpers/game';
import { BulletOptions } from '../../types/bullet';
import { Scene } from '../../types/global';
import { MonsterStats } from '../../types/monster';
import BaseMonster from '../monster';

class FireSlime extends BaseMonster {
    /* Private */
    private _bulletOptions: Pick<BulletOptions, 'damage'> = {
        damage: [20, 20],
    };
    private _stats: Partial<MonsterStats> = {
        hp: 1000,
        mp: 0,
        speed: 0.5,
        vision: 300,
        scale: 1.5,
        movementRound: 2,
        maxMovementRound: 2,
        attackRange: 0,
    };
    private _fires: { [id: string]: Phaser.Physics.Arcade.Sprite } = {};

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
        this.autoMoveToHaterAndAttack();
        this._attack();
        this.play('fire-slime-move');
    }
    private async _makeAnimations() {
        await GameHelper.loadSprite('multiatlas', 'fire-slime', 'images/monster/fire-slime/base.json', this.scene);
        this.scene.anims.create({
            key: 'fire-slime-move',
            frames: GameHelper.convertAnimations(this.scene, 'fire-slime', 'move'),
            frameRate: 8,
            repeat: Phaser.FOREVER,
        });
        this.scene.anims.create({
            key: 'fire-slime-attack',
            frames: GameHelper.convertAnimations(this.scene, 'fire-slime', 'attack'),
            frameRate: 10,
            repeat: 5,
        });
    }
    private _attack() {
        this.on(Phaser.Animations.Events.ANIMATION_UPDATE, (object: Phaser.Animations.Animation, event: Phaser.Animations.AnimationFrame) => {
            if (event.isLast && object.key == 'fire-slime-move') {
                const id = GameHelper.uuid();
                this._fires[id] = this.scene.physics.add.sprite(this.x, this.y, '');
                this._fires[id].setBodySize(22, 22);
                this._fires[id].setOffset(2, 12);
                this._fires[id].setScale(1.5);
                this._fires[id].setImmovable();
                this._fires[id].play('fire-slime-attack');
                this._fires[id].on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this._fires[id].destroy());
                this.scene.physics.add.collider(this._fires[id], this.haters, (fire, hater) => {
                    fire.destroy();
                    const [min, max] = this._bulletOptions.damage;
                    const damage = GameHelper.randomInRange(min, max);
                    // @ts-ignore
                    hater.onAttacked && hater.onAttacked({ actor: fire, damage });
                });
            }
        });
    }
}

export default FireSlime;
