import Direction from '../config/direction';
import GameHelper from '../helpers/game';
import { Actor } from '../types/actor';
import { Scene } from '../types/global';

class Weapon extends Phaser.Physics.Arcade.Sprite {
    public owner: Actor;
    public model = {
        scale: {
            x: 1,
            y: 1,
        },
        origin: {
            x: 0.5,
            y: 0.5,
        },
    };
    public coolDownRemaining: number = 0;
    public coolDown: number = 0;

    /* Private */
    private _press = false;
    private _miliseconds = 100;
    private _skillPlace: Phaser.GameObjects.Image;
    private _coolDownText: Phaser.GameObjects.Text;
    private _coolDownTimer: Phaser.Time.TimerEvent;

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
    public initBasicAttackThumb() {
        const { width, height } = this.scene.game.canvas;
        this._skillPlace = this.scene.add.image(width - 100, height - 100, 'skill-place');

        this._skillPlace.setDepth(9999).setInteractive().setScrollFactor(0).setScale(0.8);
        // @ts-ignore
        this._skillPlace._pointer = true;

        this.scene.input.addPointer(1);
        this.scene.input.on('gameobjectdown', (_pointer: any, gameObject: any) => {
            if (gameObject._pointer) {
                this._press = true;
                this.onPressBasicSkill(this._skillPlace);
            }
        });
        this.scene.input.on('gameobjectup', (_pointer: any, gameObject: any) => {
            if (gameObject._pointer) {
                this._press = false;
            }
        });
        this.onPressBasicSkill(this._skillPlace);
    }
    public canBasicAttack() {
        return this.coolDownRemaining <= 0 && this.owner.status.canAttack && this.owner.status.alive;
    }
    /**
     * @summary Set thời gian hồi chiêu
     */
    public setCoolDown() {
        if (this.owner && this.owner.status.alive && this._skillPlace) {
            this.coolDownRemaining = this.coolDown;
            this._coolDownText = this.scene.add.text(this._skillPlace.x, this._skillPlace.y, GameHelper.milisecondsToSeconds(this.coolDownRemaining));
            this._skillPlace.setAlpha(0.5);
            this._coolDownText.setTintFill(0xffffff).setScrollFactor(0).setDepth(99999).setOrigin(0.5, 0.5);
            this._coolDownTimer = this.scene.time.addEvent({
                delay: this._miliseconds,
                callback: () => {
                    this.coolDownRemaining -= this._miliseconds;
                    this._coolDownText && this._coolDownText.setText(GameHelper.milisecondsToSeconds(this.coolDownRemaining));
                    if (this.coolDownRemaining == 0 && this._skillPlace) {
                        this._coolDownTimer && this._coolDownTimer.remove();
                        this._skillPlace.setAlpha(1);
                        this._coolDownText && this._coolDownText.destroy();
                    }
                },
                loop: true,
                callbackScope: this,
            });
        }
    }
    /**
     * @summary Bắt sự kiện người dùng bấm vào nút đánh thường
     * @param {[this._skillPlace]} objects
     */
    public onPressBasicSkill(objects: any) {
        if (this._press) {
            // @ts-ignore
            this.onBasicAttack();
            setTimeout(() => {
                this.onPressBasicSkill(objects);
            }, 100);
        }
    }
    public setModel(options = {}) {
        this.model = Object.assign(this.model, options);
    }
    public async make(owner: Actor): Promise<void> {}
    /**
     * @summary Tạo vũ khí cho actor
     * @param {Actor} owner
     * @param {Phaser.Image} name
     * @param {Phaser.Atlas} atlas
     * @returns
     */
    public makeWeapon(owner: Actor, name: string, atlas: string) {
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
    public onFollowedMove(owner: Actor): Weapon {
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
    public bindCollider(objects: any) {
        this.scene.physics.add.collider(this, objects);
    }
    public resetState() {
        // @ts-ignore
        this.body.setVelocity(0);
    }
}

export default Weapon;
