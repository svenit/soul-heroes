import GameHelper from '../../../helpers/game';
import SoundManager from '../../../managers/sound';
import { Actor } from '../../../types/actor';
import { BulletOptions } from '../../../types/bullet';
import { Scene } from '../../../types/global';
import Bullet from '../../bullet';
import Weapon from '../../weapon';

class SkyShurikenWeapon extends Weapon {
    name = 'Sky Shuriken';
    classess = ['Assassin'];
    bulletImage = ['assassin-basic-attack', 'bullet_1.png'];
    attackSound = 'shuriken';

    bulletOptions: Partial<BulletOptions> = {
        speed: 7,
        attackRange: 600,
        width: 15,
        height: 15,
        scale: 1.2,
        damage: [80, 80],
        center: true,
        criticalChane: 30,
        deflection: 5,
    };
    modelOptions = {
        scale: {
            x: 1.2,
            y: 1.2,
        },
    };
    coolDown = 800;
    coolDownRemaining = 0;

    weapon: any;
    weaponAnimation!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    bullet!: Bullet;

    constructor(scene: Scene, options = {}) {
        super(scene, options);
        this.scene = scene;
    }

    /**
     * @summary Khởi tạo vũ khí cho actor
     * @param {Actor} owner
     * @returns {Weapon}
     */
    async make(owner: Actor): Promise<Weapon> {
        await GameHelper.loadSprite('multiatlas', 'assassin-basic-attack', 'images/weapons/assassin/basic-attack.json', this.scene);
        this.owner = owner;
        this.setModel(this.modelOptions);
        this.setDepth(4);
        this.weapon = this.makeWeapon(owner, 'attack_1.png', 'assassin-basic-attack');
        this.initAnimations();
        return this.weapon;
    }

    /**
     * @summary Animation cho vũ khí khi đánh thường
     */
    initAnimations() {
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
            this.weaponAnimation = this.scene.physics.add.sprite(x, y, '');
            this.weaponAnimation.body.debugBodyColor = 0x0000;
            this.weaponAnimation.setOriginFromFrame();
            this.weaponAnimation.setScale(1.6, 1.6);
            this.weaponAnimation.setDepth(4);
            this.weaponAnimation.visible = false;
            this.initBasicAttackThumb();
        }
    }

    /**
     * @summary Di chuyển vũ khí theo actor
     * @param {Owner} owner
     */
    // @ts-ignore
    onFollowedMove(owner: Actor) {
        const weapon = super.onFollowedMove(owner);
        const { x, y, body } = owner;
        if (this.weaponAnimation) {
            this.weaponAnimation.setPosition(x, y);
            this.weaponAnimation.setVelocity(body.velocity.x, body.velocity.y);
            this.weaponAnimation.angle = owner.angle;
            this.weaponAnimation.body.angle = owner.angle;
            this.weaponAnimation.scaleY = weapon.scaleY > 0 ? 1.6 : -1.6;
        }
    }

    /**
     * Reset state
     */
    resetState() {
        super.resetState();
        if (this.weaponAnimation) {
            this.weaponAnimation.setVelocity(0);
        }
    }

    /**
     * Đánh thường khi actor trigger event
     */
    onBasicAttack() {
        if (this.coolDownRemaining > 0 || !this.weaponAnimation || !this.owner.status.canAttack) return;
        this.setCoolDown();
        if (!this.weaponAnimation.visible) {
            this.weapon.visible = false;
            this.weaponAnimation.visible = true;
            this.weaponAnimation.angle = this.owner?.angle ?? 0;
            this.bullet = new Bullet(this.scene, this.weaponAnimation.x, this.weaponAnimation.y, this.bulletImage, this.bulletOptions);
            this.bullet.play('assassin-basic-attack-bullet');
            // @ts-ignore
            this.bullet.fire(this.owner, this.weaponAnimation, this.scene.enemies);
            SoundManager.play('shuriken', this.scene, {
                volume: 0.3,
            });
            this.weaponAnimation.play('assassin-basic-attack');
        }
        this.weaponAnimation.on(
            Phaser.Animations.Events.ANIMATION_UPDATE,
            (_object: any, event: Phaser.Animations.AnimationFrame) => {
                if (this.weaponAnimation && this.weaponAnimation.visible) {
                    this.weaponAnimation.body.setSize(event.frame.width, event.frame.height, false);
                    if (event.isLast) {
                        this.weaponAnimation.body.setSize(0.1, 0.1, false);
                        this.weapon.angle = this.owner?.angle ?? 1;
                        this.weapon.visible = true;
                        this.weaponAnimation.visible = false;
                        this.weaponAnimation.stop();
                    }
                }
            },
            this.scene,
        );
    }
}

export default SkyShurikenWeapon;
