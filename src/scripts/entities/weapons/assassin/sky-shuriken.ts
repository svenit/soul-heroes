import GameHelper from '../../../helpers/game';
import SoundManager from '../../../managers/sound';
import { Actor } from '../../../types/actor';
import { BulletOptions } from '../../../types/bullet';
import { Scene } from '../../../types/global';
import Bullet from '../../bullet';
import Weapon from '../../weapon';

class SkyShurikenWeapon extends Weapon {
    public name = 'Sky Shuriken';
    public classess = ['Assassin'];
    public bulletImage = ['assassin-basic-attack', 'bullet_1.png'];
    public attackSound = 'shuriken';
    public coolDown = 800;
    public coolDownRemaining = 0;

    /* Private */
    private _bulletOptions: Partial<BulletOptions> = {
        speed: 7 ,
        range: 600,
        width: 15,
        height: 10,
        scale: 1.2,
        center: true,
        deflection: 5,
    };
    private _model = {
        scale: {
            x: 1.2,
            y: 1.2,
        },
    };
    private _weaponAnimation!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    constructor(scene: Scene, options = {}) {
        super(scene, options);
    }

    /**
     * @summary Khởi tạo vũ khí cho actor
     * @param {Actor} owner
     * @returns {Weapon}
     */
    public async make(owner: Actor): Promise<void> {
        await GameHelper.loadSprite('multiatlas', 'assassin-basic-attack', 'images/weapons/assassin/basic-attack.json', this.scene);
        this.owner = owner;
        this.setModel(this._model);
        this.setDepth(4);
        this.makeWeapon(owner, 'attack_1.png', 'assassin-basic-attack');
        this._initAnimations();
    }

    /**
     * @summary Animation cho vũ khí khi đánh thường
     */
    private _initAnimations() {
        this.scene.anims.create({
            key: 'assassin-basic-attack',
            frames: GameHelper.convertAnimations(this.scene, 'assassin-basic-attack', 'attack_'),
            frameRate: 20,
            repeat: 0,
        });
        this.scene.anims.create({
            key: 'assassin-basic-attack-bullet',
            frames: GameHelper.convertAnimations(this.scene, 'assassin-basic-attack', 'bullet_'),
            frameRate: 20,
            repeat: -1,
        });
        if (this.owner) {
            const { x, y } = this.owner;
            this._weaponAnimation = this.scene.physics.add.sprite(x, y, '');
            this._weaponAnimation.body.debugBodyColor = 0x0000;
            this._weaponAnimation.setOriginFromFrame();
            this._weaponAnimation.setScale(1.6, 1.6);
            this._weaponAnimation.setDepth(4);
            this._weaponAnimation.visible = false;
            this.initBasicAttackThumb();
        }
    }

    /**
     * @summary Di chuyển vũ khí theo actor
     * @param {Owner} owner
     */
    // @ts-ignore
    public onFollowedMove(owner: Actor): Weapon {
        const weapon = super.onFollowedMove(owner);
        const { x, y, body } = owner;
        if (this._weaponAnimation) {
            this._weaponAnimation.setPosition(x, y);
            this._weaponAnimation.setVelocity(body.velocity.x, body.velocity.y);
            this._weaponAnimation.angle = owner.angle;
            this._weaponAnimation.body.angle = owner.angle;
            this._weaponAnimation.scaleY = weapon.scaleY > 0 ? 1.6 : -1.6;
        }
    }

    /**
     * Reset state
     */
    public resetState() {
        super.resetState();
        if (this._weaponAnimation) {
            this._weaponAnimation.setVelocity(0);
        }
    }

    /**
     * Đánh thường khi actor trigger event
     */
    public onBasicAttack() {
        if (this.canBasicAttack()) {
            this.setCoolDown();
            if (!this._weaponAnimation.visible) {
                this.visible = false;
                this._weaponAnimation.visible = true;
                this._weaponAnimation.angle = this.owner?.angle ?? 0;
                const bullet = new Bullet(this.scene, this._weaponAnimation.x, this._weaponAnimation.y, this.bulletImage, this._bulletOptions);
                bullet.play('assassin-basic-attack-bullet');
                // @ts-ignore
                bullet.fire(this.owner, this._weaponAnimation, this.scene.enemies);
                SoundManager.play('shuriken', this.scene, {
                    volume: 0.3,
                });
                this._weaponAnimation.play('assassin-basic-attack');
            }
            this._weaponAnimation.on(
                Phaser.Animations.Events.ANIMATION_UPDATE,
                (_object: any, event: Phaser.Animations.AnimationFrame) => {
                    if (this._weaponAnimation && this._weaponAnimation.visible) {
                        this._weaponAnimation.body.setSize(event.frame.width, event.frame.height, false);
                        if (event.isLast) {
                            this._weaponAnimation.body.setSize(0.1, 0.1, false);
                            this.angle = this.owner?.angle ?? 1;
                            this.visible = true;
                            this._weaponAnimation.visible = false;
                            this._weaponAnimation.stop();
                        }
                    }
                },
                this.scene,
            );
        }
    }
}

export default SkyShurikenWeapon;
