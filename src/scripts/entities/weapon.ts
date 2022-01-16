import Direction from '../config/direction';
import GameHelper from '../helpers/game';
import { Actor } from '../types/actor';
import { Scene } from '../types/global';

class Weapon extends Phaser.Physics.Arcade.Sprite {
    alive = true;
    model = {
        scale: {
            x: 1,
            y: 1,
        },
        origin: {
            x: 0.5,
            y: 0.5,
        },
    };
    owner: Actor;
    press = false;
    miliseconds = 100;
    skillPlace: Phaser.GameObjects.Image;
    coolDownRemaining: number = 0;
    coolDown: number = 0;
    coolDownText: Phaser.GameObjects.Text;
    coolDownTimer: Phaser.Time.TimerEvent;

    constructor(scene: Scene, options: any = {}) {
        // @ts-ignore
        super(scene, 0, 0);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        if (options.colliders) {
            this.bindCollider(options.colliders);
        }
        this.body.debugBodyColor = 0x66666;
        this.body.setSize(0.1, 0.1);
    }
    /**
     * @summary Tạo nút bấm cho đánh thường vào màn hình chính
     */
    initBasicAttackThumb() {
        const { width, height } = this.scene.game.canvas;
        this.skillPlace = this.scene.add.image(width - 100, height - 100, 'skill-place');

        this.skillPlace.setDepth(9999).setInteractive().setScrollFactor(0).setScale(0.8);
        // @ts-ignore
        this.skillPlace._pointer = true;

        this.scene.input.addPointer(1);
        this.scene.input.on('gameobjectdown', (_pointer: any, gameObject: any) => {
            if (gameObject._pointer) {
                this.press = true;
                this.onPressBasicSkill(this.skillPlace);
            }
        });
        this.scene.input.on('gameobjectup', (_pointer: any, gameObject: any) => {
            if (gameObject._pointer) {
                this.press = false;
            }
        });
        this.onPressBasicSkill(this.skillPlace);
    }
    /**
     * Set thời gian hồi chiêu
     */
    setCoolDown() {
        if (this.owner && this.owner.status.alive && this.skillPlace) {
            this.coolDownRemaining = this.coolDown;
            this.coolDownText = this.scene.add.text(
                this.skillPlace.x,
                this.skillPlace.y,
                GameHelper.milisecondsToSeconds(this.coolDownRemaining),
            );
            this.skillPlace.setAlpha(0.5);
            this.coolDownText.setTintFill(0xffffff).setScrollFactor(0).setDepth(99999).setOrigin(0.5, 0.5);
            this.coolDownTimer = this.scene.time.addEvent({
                delay: this.miliseconds,
                callback: () => {
                    this.coolDownRemaining -= this.miliseconds;
                    this.coolDownText && this.coolDownText.setText(GameHelper.milisecondsToSeconds(this.coolDownRemaining));
                    if (this.coolDownRemaining == 0 && this.skillPlace) {
                        this.coolDownTimer && this.coolDownTimer.remove();
                        this.skillPlace.setAlpha(1);
                        this.coolDownText && this.coolDownText.destroy();
                    }
                },
                loop: true,
                callbackScope: this,
            });
        }
    }
    /**
     * @summary Bắt sự kiện người dùng bấm vào nút đánh thường
     * @param {[this.skillPlace]} objects
     */
    onPressBasicSkill(objects: any) {
        if (this.press) {
            // @ts-ignore
            this.onBasicAttack();
            setTimeout(() => {
                this.onPressBasicSkill(objects);
            }, 100);
        }
    }
    setModel(options = {}) {
        this.model = Object.assign(this.model, options);
    }
    /**
     * @summary Tạo vũ khí cho actor
     * @param {Actor} owner
     * @param {Phaser.Image} name
     * @param {Phaser.Atlas} atlas
     * @returns
     */
    makeWeapon(owner: Actor, name: string, atlas: string) {
        this.owner = owner;
        const { scale, origin } = this.model;
        !!atlas ? this.setTexture(atlas, name) : this.setTexture(name);
        this.scaleX = scale.x;
        this.scaleY = scale.y;
        this.setPosition(owner.x, owner.y);
        this.setOrigin(origin.x, origin.y);
        return this;
    }
    /**
     * @summary Di chuyển theo actor
     * @param {Actor} owner
     * @returns {Weapon} this
     */
    onFollowedMove(owner: Actor): Weapon {
        const { scale } = this.model;
        const { x, y, _angle, direction, body } = owner;
        this.setPosition(x, y);
        // @ts-ignore
        this.body.setVelocity(body.velocity.x, body.velocity.y);
        this.angle = _angle ?? 0;
        const isFlipX = [Direction.LEFT, Direction.TOP_LEFT, Direction.BOTTOM_LEFT].includes(direction ?? '');
        this.scaleY = isFlipX ? -scale.y : scale.y;
        return this;
    }
    /**
     * @summary Bắt sự kiện va chạm
     * @param {Phaser.Arcade.Sprite} objects
     * @param {Callback} callback
     */
    bindCollider(objects: any) {
        this.scene.physics.add.collider(this, objects);
    }
    resetState() {
        // @ts-ignore
        this.body.setVelocity(0);
    }
}

export default Weapon;
