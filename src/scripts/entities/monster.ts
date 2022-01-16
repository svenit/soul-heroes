import Direction from '../config/direction';
import GameConfig from '../config/game';
import Groups from '../config/groups';
import GameHelper from '../helpers/game';
import { Actor } from '../types/actor';
import { OnAttacked, PhysicBody, Scene } from '../types/global';
import { MonsterStats, MonsterStatuses } from '../types/monster';
import Bar from './bar';

class BaseMonster extends Phaser.Physics.Arcade.Sprite {
    stats: MonsterStats = {
        hp: 0,
        mp: 0,
        physicalResistance: 0,
        magicResistance: 0,
        luck: 0,
        speed: 1,
        agility: 0,
        vision: 0,
        scale: 1,
        attackRange: 0,
        movementRound: 2,
        maxMovementRound: 2,
        strength: 0,
        intelligence: 0,
        attackSpeed: 0,
        accuracy: 0,
        weaponMastery: 0,
        cooldownSpeed: 0,
    };
    status: MonsterStatuses = {
        alive: true,
        canAttack: true,
        canMove: true,
        isCanSeeHater: false,
    };
    drop = {
        xp: [0, 0],
    };

    hp: Bar;
    followers: Phaser.GameObjects.GameObject[] = [];
    haters: Phaser.GameObjects.GameObject[] = [];
    haterTypes: string[] = [Groups.Player];
    gfx: Phaser.GameObjects.Graphics;
    getHatersTimer: Phaser.Time.TimerEvent;
    moveToHaterTimer: Phaser.Time.TimerEvent;
    moveByAITimer: Phaser.Time.TimerEvent;

    constructor(scene: Scene, x: number, y: number) {
        // @ts-ignore
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.name = Groups.Monster;
        this.gfx = this.scene.add.graphics();
        this.setImmovable();
    }
    makeMonster() {
        this.hp = new Bar(this.scene, this.x, this.y, this, {
            total: this.stats.hp,
        });
        this.followers.push(this.hp);
        /* Lấy ra haters */
        this.getHatersTimer = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                const { alive, canMove } = this.status;
                if (!alive && this.getHatersTimer) {
                    return this.getHatersTimer.remove();
                }
                if (!canMove) {
                    // @ts-ignore
                    this.body.setVelocity(0);
                    this.triggerFollowersMove();
                }
                this.haters = this.scene.children.list.filter((child: Phaser.GameObjects.GameObject) => this.haterTypes.includes(child.name));
            },
            callbackScope: this,
            loop: true,
        });
    }
    setStats(stats: Partial<MonsterStats> = {}) {
        this.stats = Object.assign(this.stats, stats);
    }
    autoMoveToHaterAndAttack(injectCallback: CallableFunction | null = null) {
        const { alive, canMove } = this.status;
        if (alive && canMove) {
            this.moveByAI();
            this.moveToHaterTimer = this.scene.time.addEvent({
                delay: GameHelper.randomInRange(500, 1000),
                callback: () => {
                    if (!this.status.alive && this.moveToHaterTimer) {
                        return this.moveToHaterTimer.remove();
                    }
                    this.gfx.clear();
                    if (injectCallback) injectCallback();
                    const closestHater = this.scene.physics.closest(
                        this,
                        this.haters.filter((enemy: any) => enemy.status.alive),
                    ) as Actor;
                    if (closestHater && closestHater.status.alive) {
                        const { angle, distance } = GameHelper.getDistance(this, closestHater);
                        this.status.isCanSeeHater = false;
                        if (this.stats.vision && this.stats.vision >= distance) {
                            const direction = GameHelper.getDirectionFromAngle(angle);
                            const isMoveLeft = [Direction.LEFT, Direction.TOP_LEFT, Direction.BOTTOM_LEFT].includes(direction);
                            this.setFlipX(isMoveLeft);
                            this.status.isCanSeeHater = true;
                            if (GameConfig.showMonterVisionRange) {
                                this.gfx.lineStyle(5, 0x5832a8).lineBetween(closestHater.x, closestHater.y, this.x, this.y);
                            }
                            if (this.stats.attackRange && this.stats.attackRange >= distance) {
                                this.moveByAI();
                                this.setFlipX(isMoveLeft);
                                // @ts-ignore
                                return this.attack && this.attack(closestHater, angle);
                            }
                            return this.changeDirection(angle, this.stats.speed ?? 0);
                        }
                    }
                    this.moveByAI();
                },
                callbackScope: this,
                loop: true,
            });
            // @ts-ignore
            this.addColliders(this.scene.globalColliders, () => this.moveByAI());
        }
    }
    autoMoveByAI() {
        if (this.status.alive && this.status.canMove) {
            this.moveByAI();
            this.moveByAITimer = this.scene.time.addEvent({
                delay: GameHelper.randomInRange(500, 2000),
                callback: () => {
                    if (!this.status.alive && this.moveByAITimer) this.moveByAITimer.remove();
                    this.moveByAI();
                },
                callbackScope: this,
                loop: true,
            });
            // @ts-ignore
            this.addColliders(this.scene.globalColliders, () => this.moveByAI());
        }
    }
    moveByAI() {
        if (this.status.alive && this.status.canMove) {
            const { speed } = this.stats;
            const angle = GameHelper.randomInRange(-180, 180);
            if (this.stats.maxMovementRound == this.stats.movementRound) {
                this.stats.movementRound = 0;
                this.changeDirection(angle, speed ?? 0);
            }
            // @ts-ignore
            this.stats.movementRound++;
        }
    }
    changeDirection(angle: number, speed: number) {
        if (this.status.alive && this.status.canMove) {
            GameHelper.moveByAngle(this, angle, speed, false);
            this.setFlipX(this.body.velocity.x < 0);
            this.triggerFollowersMove();
        }
    }
    triggerFollowersMove() {
        if (this.status.alive) {
            this.followers.forEach((follower: any) => follower.onFollowedMove && follower.onFollowedMove(this));
        }
    }
    addColliders(objects: PhysicBody[], callback: ArcadePhysicsCallback) {
        this.scene.physics.add.collider(this, objects, callback);
    }
    onEnemyDie() {
        console.log('HELL');
    }
    onAttacked({ actor, damage, showText = true, criticalAttack = false }: OnAttacked) {
        const { agility } = this.stats;
        const randomDodgeChane = GameHelper.randomInRange(0, 100);
        if (agility && agility >= randomDodgeChane + (actor.stats?.accuracy ?? 0)) {
            return GameHelper.showFadeText(this.scene, this.x, this.y, 'Né', false, null);
        }
        const isDied = this.hp && this.hp.decrease(damage);
        if (showText) GameHelper.showFadeText(this.scene, this.x, this.y, damage.toString(), criticalAttack, null);
        this.setTint(0xff0000);
        this.scene.time.addEvent({
            delay: 80,
            callback: () => {
                this.clearTint();
            },
            callbackScope: this,
            loop: false,
        });
        if (isDied) {
            this.status.alive = false;
            actor && actor.onEnemyDie && actor.onEnemyDie();
            this.onDie();
        }
    }
    onDie() {
        this.followers.forEach((follower: any) => follower.destroy());
        this.destroy();
    }
}

export default BaseMonster;
