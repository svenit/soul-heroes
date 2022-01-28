import Direction from '../config/direction';
import GameConfig from '../config/game';
import GearsStorage from '../config/gears';
import Groups from '../config/groups';
import GameHelper from '../helpers/game';
import { Actor, DamageType } from '../types/actor';
import { OnAttacked, PhysicBody, Scene, Stats } from '../types/global';
import { GearOptions, PlayerStatuses } from '../types/player';
import Bar from './bar';
import Shadow from './shadow';
import Weapon from './weapon';

class Player extends Phaser.Physics.Arcade.Sprite implements Actor {
    public status: PlayerStatuses = {
        alive: true,
        canMove: true,
        canAttack: true,
        canUseSkill: true,
    };
    public stats: Stats = {
        strength: [0, 0],
        intelligence: [0, 0],
        hp: 0,
        mp: 0,
        speed: 1,
        luck: 0,
        attackSpeed: 0,
        physicalResistance: 0,
        magicResistance: 0,
        agility: 0,
        autoAimRange: 0,
        accuracy: 0,
        dexterity: 0,
        cooldownSpeed_: 0,
        criticalX_: 0,
    };
    public model = {
        offset: {
            x: 0,
            y: 0,
        },
        width: 32,
        height: 32,
    };
    public bodyContainer: Phaser.GameObjects.Container;
    public gearContainer: Phaser.GameObjects.Container;
    public gearsKeys: { [key: string]: Phaser.GameObjects.Image } = {};
    public followers: any = [];
    public hp: Bar;
    public weapon: Weapon;
    public direction: string = '';

    /* Public Exception */
    public _direction: string = '';
    public _angle: number = 0;

    /* Private */
    private _options = {
        makeShadow: true,
        autoAim: true,
    };
    private _gfx: Phaser.GameObjects.Graphics;
    private _gearTimer: Phaser.Time.TimerEvent;
    private _isGearDown: boolean = false;
    private _footStepSound: Phaser.Sound.BaseSound;
    private _autoAimEnemyTimer: Phaser.Time.TimerEvent;

    constructor(scene: Scene, x: number, y: number, options = {}) {
        // @ts-ignore
        super(scene, x, y);
        this._options = Object.assign(this._options, options);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this._gfx = this.scene.add.graphics();
        this.name = Groups.Player;
        // @ts-ignore
        this.body.setVelocity(0).setCollideWorldBounds(true);
        this.body.setSize(32, 46, true);
        this.body.debugBodyColor = 0x09b500;
        this.setImmovable();
        this.setDepth(3);
        this.initMovementSound();

        this.bodyContainer = this.scene.add.container();
        this.bodyContainer.setPosition(this.x, this.y);
        this.scene.physics.world.enable(this.bodyContainer);

        if (this._options.makeShadow) {
            const shadow = new Shadow(this.scene, {
                x: 0,
                y: 20,
                scale: 0.5,
            });
            this.bodyContainer.add(shadow);
        }
    }
    /**
     * Set điểm thuộc tính cho actor
     */
    public initStats(stats: Partial<Stats> = {}) {
        this.stats = Object.assign(this.stats, stats);
        this.hp = new Bar(this.scene, this, {
            total: this.stats.hp,
        });
        this.bodyContainer && this.bodyContainer.add(this.hp);
    }
    /**
     * @param {gearsOptions} options
     * @summary Trang bị các gear cho actor
     */
    public initGear(options: Partial<GearOptions> = {}) {
        this.gearsKeys = {};

        this.gearContainer = this.scene.add.container();
        this.gearContainer.setPosition(this.x, this.y);
        this.scene.physics.world.enable(this.gearContainer);

        Object.entries(options).forEach(([type, gearName]) => {
            // @ts-ignore
            if (GearsStorage[type][gearName]) {
                // @ts-ignore
                const { name, scale, origin } = GearsStorage[type][gearName];
                this.gearsKeys[type] = this.scene.add.image(0, 0, 'gears', name);
                this.gearsKeys[type].type = type;
                this.gearsKeys[type].name = gearName;
                if (origin) this.gearsKeys[type].setOrigin(origin.x ?? 0.5, origin.y ?? 0.5);
                if (scale) this.gearsKeys[type].setScale(scale);
                this.gearContainer && this.gearContainer.add(this.gearsKeys[type]);
            }
        });

        this.gearContainer.setDepth(3);
        // @ts-ignore
        this.gearContainer.body.debugBodyColor = 0xf54242;
        // @ts-ignore
        this.gearContainer.body.setSize(0.1, 0.1).setCollideWorldBounds(true);

        this._gearTimer = this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                if (this.status.canMove) {
                    this.gearContainer &&
                        this.gearContainer.setPosition(
                            this.gearContainer.x,
                            this._isGearDown ? this.gearContainer.y - 1 : this.gearContainer.y + 1,
                        );
                    this._isGearDown = !this._isGearDown;
                }
            },
            callbackScope: this,
            loop: true,
        });
    }
    /**
     * @summary Init âm thanh lúc di chuyển
     */
    public async initMovementSound() {
        this._footStepSound = this.scene.sound.add('foot-step', {
            volume: 0.05,
            loop: false,
            delay: 0,
        });
    }
    /**
     * @summary Set model
     */
    public setModel(key: string, value: any) {
        // @ts-ignore
        this.model[key] = Object.assign(this.model[key], value);
        this.updateModel();
    }
    /**
     * @summary Cập nhật model
     */
    public updateModel() {
        const { offset } = this.model;
        this.body.offset.x = offset.x;
        this.body.offset.y = offset.y;
    }
    /**
     * @summary Di chuyển gears theo actor
     */
    public moveGear() {
        if (this.gearContainer) {
            this.gearContainer.setPosition(this.x, this._isGearDown ? this.y - 1 : this.y + 1);
            // @ts-ignore
            this.gearContainer.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
            // @ts-ignore
            this.gearContainer.direction = this.direction;
        }
    }
    public moveBodyContainer() {
        if (this.bodyContainer) {
            this.bodyContainer.setPosition(this.x, this.y);
            // @ts-ignore
            this.bodyContainer.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
        }
    }
    /**
     * @summary Bắt sự kiện actor di chuyển
     */
    public onMove() {
        if (this.status.alive && this.status.canMove) {
            const { offset } = this.model;
            this.body.offset.set(offset.x, offset.y);
            this._direction = GameHelper.getDirectionFromAngle(this._angle);
            this.triggerFolowers();
            this.moveGear();
            this.moveBodyContainer();
            this.autoAimEnemy();
            if (!this._footStepSound.isPlaying) this._footStepSound.play();
            /* Vẽ attack range */
            if (GameConfig.showAutoAimRange) GameHelper.drawAutoAimRange(this.scene, this, this.stats.autoAimRange ?? 0);
        }
    }
    /**
     * @summary Di chuyển theo chiều dọc
     */
    public moveByVertical() {
        this.direction = this.body.velocity.y <= 0 ? Direction.TOP : Direction.BOTTOM;
    }
    /**
     * @summary Di chuyển theo chiều ngang
     */
    public moveByHorizontal() {
        if (this.gearContainer) {
            if (this.body.velocity.x == 0) return;
            if (this.body.velocity.x < 0) {
                this.direction = Direction.LEFT;
                return (this.gearContainer.scaleX = -1);
            }
            this.gearContainer.scaleX = 1;
            this.direction = Direction.RIGHT;
        }
    }
    /**
     * @summary Lấy ra đối thủ gần nhất và quay actor theo chiều đối thủ nếu bật autoAim
     */
    public autoAimEnemy() {
        if (this.status.alive && this.status.canMove) {
            this.angle = this._angle ?? this.angle;
            if (this.weapon) this.weapon.angle = this.angle;
            this.moveByVertical();
            this.moveByHorizontal();
            if (this._options.autoAim) {
                this._gfx.clear();
                /* Lấy enemy gần nhất */
                // @ts-ignore
                const enemiesLive = this.scene.enemies.filter((enemy: Actor) => enemy.status.alive);
                const closestEnemy = this.scene.physics.closest(this, enemiesLive) as PhysicBody;
                if (closestEnemy && this.weapon) {
                    const { angle, distance } = GameHelper.getDistance(this, closestEnemy);
                    if (this.stats.autoAimRange && this.stats.autoAimRange >= distance) {
                        /* Hiển thị tool line đến đối tương gần nhất */
                        if (GameConfig.showAimLine) {
                            this._gfx.lineStyle(2, 0xff3300).lineBetween(closestEnemy.x, closestEnemy.y, this.x, this.y);
                        }
                        /* Auto aim vào đối thủ */
                        this.angle = angle;
                        this.weapon.angle = angle;
                        const direction = GameHelper.getDirectionFromAngle(angle);
                        const isMoveLeft = [Direction.LEFT, Direction.TOP_LEFT, Direction.BOTTOM_LEFT].includes(direction);
                        /* Nếu actor quay trái thì flip actor */
                        if (isMoveLeft && this.gearContainer) {
                            return (this.gearContainer.scaleX = -1);
                        }
                        if (this.gearContainer) this.gearContainer.scaleX = 1;
                    }
                }
            }
        }
    }
    /**
     * @summary Trigger event các follower vào actor khi actor di chuyển
     */
    public triggerFolowers() {
        if (this.status.alive) this.followers.forEach((follower: any) => follower.onFollowedMove(this));
    }
    /**
     * @summary Bắt sự kiện va chạm của actor với các objects khác
     */
    public bindCollider(objects: any, callback?: ArcadePhysicsCallback) {
        this.scene.physics.add.collider(this, objects, callback);
        this.bindColliderForGears(objects, callback);
    }
    /**
     *
     * @summary Bắt sự kiện va chạm của các gears với các objects khác
     */
    public bindColliderForGears(objects: any, callback?: ArcadePhysicsCallback) {
        this.gearContainer && this.scene.physics.add.collider(this.gearContainer, objects, callback);
    }
    /**
     *
     * @param {Weapon} weapon
     * @summary Sử dụng vũ khí cho actor
     */
    public async useWeapon(weapon: Weapon) {
        await weapon.make(this);
        this.weapon = weapon;
        this.followers.push(weapon);
        this.setOrigin(0.5, 1);
        this.setModel('offset', {
            x: 0,
            y: 8,
        });
        this.autoAimEnemy();
        this._autoAimEnemyTimer = this.scene.time.addEvent({
            delay: 10,
            callback: () => {
                if (!this.status.alive && this._autoAimEnemyTimer) return this._autoAimEnemyTimer.remove();
                this.autoAimEnemy();
            },
            callbackScope: this,
            loop: true,
        });
    }
    public getBasicDamageType(): DamageType {
        return 'strength';
    }
    public getBasicDamage() {
        const [min, max] = this.stats[this.getBasicDamageType()];
        return {
            min,
            max,
            avg: GameHelper.randomInRange(min, max),
        };
    }
    public getDamageResistance(type: string) {
        return this.stats[type];
    }
    /**
     * @summary Reset state của actor và các follower
     */
    public resetState() {
        if (this.status.alive) {
            // @ts-ignore
            this.body.setVelocity(0);
            // @ts-ignore
            this.gearContainer && this.gearContainer.body.setVelocity(0);
            // @ts-ignore
            this.bodyContainer && this.bodyContainer.body.setVelocity(0);
            this.followers.forEach((follower: PhysicBody) => follower.resetState && follower.resetState());
        }
    }
    /**
     * @summary Trigger khi enemy bị bạn bắn chết
     */
    public onEnemyDie() {}
    /**
     * @summary Khi actor bị tấn công và nhận damage, nếu actor chết gọi callback onEnemyDie của người ra đòn
     * @param {number} damage
     */
    public onAttacked({ actor, state }: OnAttacked) {
        const isDied = this.hp && this.hp.decrease(state.damage);
        this.gearContainer && this.gearContainer.getAll('body').forEach((gear: any) => gear.setTint(0xff0000));
        this.scene.time.addEvent({
            delay: 80,
            callback: () => {
                this.gearContainer && this.gearContainer.getAll('body').forEach((gear: any) => gear.clearTint());
            },
            callbackScope: this,
            loop: false,
        });
        if (isDied) {
            this.status.alive = false;
            if (actor && actor.onEnemyDie) actor.onEnemyDie();
            this.destroy();
        }
    }
    /**
     * @summary Bắt sự kiện khi actor chết
     */
    public async onDie() {
        await GameHelper.loadSprite('image', 'die', 'images/common/die.png', this.scene);
        this.angle = 0;
        this.gearContainer && this.gearContainer.destroy();
        this.bodyContainer && this.bodyContainer.destroy();
        // @ts-ignore
        this.body.setVelocity(0, 0);
        this.stop();
        this.setTexture('die');
    }
    /**
     * @summary Bắt sự kiện khi actor object bị destroy
     */
    public async destroy() {
        await this.onDie();
        this.followers.forEach((follower: any) => follower.destroy());
        this.scene.tweens.add({
            targets: this,
            duration: 2000,
            delay: 0,
            alpha: 0,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                super.destroy();
            },
        });
    }
}

export default Player;
