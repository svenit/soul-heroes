import Direction from '../config/direction';
import Groups from '../config/groups';
import GameHelper from '../helpers/game';
import { Actor } from '../types/actor';
import { BulletOptions } from '../types/bullet';
import { BaseActorStatus, CollierType, Scene } from '../types/global';

class Bullet extends Phaser.Physics.Arcade.Sprite {
    public status: BaseActorStatus = {
        alive: true,
        canMove: true,
        canAttack: true,
    };
    public options: BulletOptions = {
        damage: [1, 1],
        speed: 1,
        attackRange: 1,
        width: 1,
        height: 1,
        scale: 1,
        rotation: 0,
        center: false,
        scaleIncre: 0,
        damageIcre: 0,
        criticalChane: 0,
        criticalX: 2,
        deflection: 0,
    };

    /* Private */
    private _timer: Phaser.Time.TimerEvent;

    constructor(scene: Scene, x: number, y: number, texture: string | string[], options: Partial<BulletOptions> = {}) {
        // @ts-ignore
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        if (!texture) this.setVisible(false);
        if (texture) {
            const [altas, name] = texture;
            Array.isArray(texture) ? this.setTexture(altas, name) : this.setTexture(name);
        }
        this.setImmovable();
        this.name = Groups.Bullet;
        this.options = Object.assign(this.options, options);
    }
    public fire(
        actor: Actor,
        weapon: Phaser.GameObjects.Sprite,
        targets: Phaser.GameObjects.GameObject[] = [],
        callbackOnAttacked?: CallableFunction,
        callbackOnColliderGround?: CallableFunction,
    ) {
        let { attackRange, width, height, speed, scale, rotation, damage, center, scaleIncre, damageIcre, criticalChane, criticalX, deflection } = this.options;
        let criticalAttack = false;
        const { weaponMastery } = actor.stats;
        /* Sát thương gây ra */
        const [minDamage, maxDamage] = damage;
        let realDamage = GameHelper.randomInRange(minDamage, maxDamage);
        /* Tỉ lệ chí mạng */
        const randomCriticalChane = GameHelper.randomInRange(0, 100);
        if (randomCriticalChane <= criticalChane) {
            realDamage *= criticalX;
            criticalAttack = true;
        }
        /* Độ lệch đạn */
        deflection = deflection - weaponMastery < 0 ? 0 : deflection - weaponMastery;
        const randomDeflection = GameHelper.randomInRange(-deflection, deflection);
        /* Chỉnh physic cho đạn */
        const freezeWeapon = Object.assign({}, weapon);
        this.angle = weapon.angle + randomDeflection;
        const direction = GameHelper.getDirectionFromAngle(this.angle);
        if ([Direction.BOTTOM, Direction.TOP].includes(direction)) {
            this.setOrigin(0.5, 0.5);
            [width, height] = [height, width];
        }
        this.setScale(scale);
        this.setBodySize(width, height, center);
        /* Set collider cho bullet */
        // @ts-ignore
        this.scene.physics.add.collider(this, this.scene.bulletColliders, (bullet: CollierType, target: CollierType) => {
            if (callbackOnColliderGround) return callbackOnColliderGround(bullet, target);
            this.destroy();
        });
        /* Di chuyển đạn theo hướng của actor */
        GameHelper.moveByAngle(this, weapon.angle + randomDeflection, speed);
        // @ts-ignore
        this.scene.physics.add.overlap(this, targets, (bullet: BaseBullet, target: Actor) => {
            /* Nếu đã attack đối tượng trước đó thì không attack lại nữa */
            if (bullet.attacked != target) {
                if (target.status.alive) {
                    bullet.destroy();
                    if (this._timer) this._timer.remove();
                }
                realDamage = GameHelper.convertToFloat(realDamage, 2);
                target.onAttacked && target.onAttacked({ actor, damage: realDamage, criticalAttack });
            }
            callbackOnAttacked && callbackOnAttacked(target);
            bullet.attacked = target;
        });
        /* Nếu khoảng cách viên đạn vượt quá attackRange thì destroy */
        this._timer = this.scene.time.addEvent({
            delay: 10,
            callback: () => {
                const { distance } = GameHelper.getDistance(freezeWeapon, this);
                this.rotation += rotation;
                this.scale += scaleIncre;
                realDamage += damageIcre;
                if (distance > attackRange) {
                    this.destroy();
                    this._timer && this._timer.remove();
                }
            },
            callbackScope: this,
            loop: true,
        });
    }
}

export default Bullet;
