import Direction from '../config/direction';
import GameConfig from '../config/game';
import { Actor } from '../types/actor';
import { RealDamageOptions, Scene } from '../types/global';

class GameHelper {
    static loaded: string[] = [];
    static attackRange: Phaser.GameObjects.Shape;

    static moveByAngle(object: Actor | any, angle: number, speed = 1, increment = true) {
        if (object.status.alive && object.status.canMove) {
            const x = 100 * speed * Math.cos((angle * Math.PI) / 180);
            const y = 100 * speed * Math.sin((angle * Math.PI) / 180);
            if (increment) {
                object.body.velocity.x += x;
                object.body.velocity.y += y;
            } else {
                object.body.velocity.x = x;
                object.body.velocity.y = y;
            }
            object._angle = angle;
        }
    }
    static renderDebug(object: Phaser.Tilemaps.TilemapLayer, game: Scene) {
        if (GameConfig.debug) {
            const debugGraphics = game.add.graphics().setAlpha(0.7);
            object.renderDebug(debugGraphics, {
                tileColor: null,
                collidingTileColor: new Phaser.Display.Color(234, 234, 48, 255),
                faceColor: new Phaser.Display.Color(40, 39, 37, 255),
            });
        }
    }
    static async loadSprite(type: string, name: string, pathToImage: string, scene: Scene) {
        const loadedKey = `${type}-${name}-${pathToImage}`;
        if (!this.loaded.includes(loadedKey)) {
            return new Promise((resolve) => {
                const loader = new Phaser.Loader.LoaderPlugin(scene);
                /* @ts-ignore */
                loader[type](name, pathToImage);
                loader.once(Phaser.Loader.Events.COMPLETE, () => {
                    this.loaded.push(loadedKey);
                    resolve(loader);
                });
                loader.start();
            });
        }
    }
    static getDirectionFromAngle(angle: number) {
        const directions = [
            Direction.RIGHT,
            Direction.BOTTOM_RIGHT,
            Direction.BOTTOM,
            Direction.BOTTOM_LEFT,
            Direction.LEFT,
            Direction.TOP_LEFT,
            Direction.TOP,
            Direction.TOP_RIGHT,
        ];
        const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
        return directions[index];
    }
    static randomInRange(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    static rectsIntersect(xBox: Phaser.GameObjects.Sprite, yBox: Phaser.GameObjects.Sprite) {
        return (
            xBox.x + xBox.width > yBox.x && xBox.x < yBox.x + yBox.width && xBox.y + xBox.height > yBox.y && xBox.y < yBox.y + yBox.height
        );
    }
    static getDistance(xBox: Phaser.GameObjects.Sprite, yBox: Phaser.GameObjects.Sprite) {
        const dx = xBox.x - yBox.x;
        const dy = xBox.y - yBox.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI;
        const angleCircle = angle < 0 ? angle + 360 : angle;

        return {
            distance,
            angle,
            angleCircle,
            dx,
            dy,
        };
    }
    static requestFullScreen() {
        const element = document.body;
        const requestMethod = element.requestFullscreen;
        requestMethod && requestMethod.call(element);
    }
    static milisecondsToSeconds(ms: number) {
        ms = ms / 1000;
        return `${ms}s`;
    }
    static drawAutoAimRange(scene: Scene, actor: Phaser.GameObjects.Sprite, attackRange: number) {
        this.attackRange && this.attackRange.destroy();
        this.attackRange = scene.add.circle(actor.x, actor.y, attackRange);
        this.attackRange.setStrokeStyle(2, 0xff3300);
    }
    static uuid() {
        const tempURL = URL.createObjectURL(new Blob());
        const uuid = tempURL.toString();
        URL.revokeObjectURL(tempURL);
        return uuid.substr(uuid.lastIndexOf('/') + 1);
    }
    static convertToFloat(number: any, fixed: number) {
        return `${number}`.includes('.') ? parseFloat(number).toFixed(fixed) : number;
    }
    static showFadeText(scene: Scene, x: number, y: number, text: string, criticalAttack: boolean, textSyle: any) {
        textSyle = Object.assign(
            {
                color: '#fff',
                fontFamily: 'PixelSan',
                fontSize: '24px',
                stroke: '#000',
                strokeThickness: 2,
            },
            textSyle,
        );
        let critical: Phaser.GameObjects.Image | null = null;
        if (criticalAttack) {
            textSyle.color = '#fff';
            textSyle.fontSize = '17px';
            critical = scene.add.image(x, y, 'critical');
            critical.setDepth(5);
        }
        const textSprite = scene.add.text(x, y, text, textSyle);
        textSprite.setOrigin(0.5, 0.5);
        textSprite.setDepth(6);
        y = y - (criticalAttack ? 80 : this.randomInRange(30, 70));
        x = this.randomInRange(x - (criticalAttack ? 50 : 30), x + (criticalAttack ? 50 : 30));
        const animations = scene.tweens.add({
            targets: [textSprite, critical],
            ease: 'Power2',
            alpha: 0.8,
            duration: criticalAttack ? 800 : 500,
            scale: 0.8,
            y,
            x,
            onComplete: () => {
                textSprite.destroy();
                critical && critical.destroy();
                animations.remove();
            },
        });
    }
    static convertAnimations(scene: Scene, spriteKey: string, prefix: string) {
        // @ts-ignore
        const frames = scene.anims.generateFrameNames(spriteKey).filter((frame) => frame.frame.includes(prefix));
        return scene.anims.generateFrameNames(spriteKey, {
            outputArray: frames,
        });
    }
    static getChane(a: number, b: number) {
        a = a == 0 ? 1 : a + 1;
        b = b == 0 ? 1 : b + 1;
        const max = Math.max(a, b);
        const subChane = a - b;
        if (subChane == 0) return false;
        const chane = (subChane / max) * 100;
        if (chane < 0) return false;
        return chane <= this.randomInRange(0, 100);
    }
    static getValuePercent(percent: number, total: number) {
        return (percent / 100) * total;
    }
    static getRealDamage(
        scene: Scene,
        actor: Actor,
        target: Actor,
        options: RealDamageOptions = {
            realDamage: 0,
        },
    ) {
        if (actor.status.alive && target.status.alive) {
            const damageOpposite = {
                strength: 'physicalResistance',
                intelligence: 'magicResistance',
            };
            const actorStats = actor.stats;
            const targetStats = target.stats;
            const resistanceType = damageOpposite[actor.getBasicDamageType()] as 'physicalResistance' | 'magicResistance';

            /* Actor */
            const actorDamage = actor.getBasicDamage().avg + options.realDamage;

            /* Target */
            const targetResistance = target.getDamageResistance(resistanceType);

            /* Né */
            if (this.getChane(actorStats.accuracy, targetStats.agility)) {
                this.showFadeText(scene, target.x, target.y, 'Né', false, null);
                return 0;
            }

            /* Tính sát thương chí mạng */
            let isCritical = false;
            let criticalX = 1;
            const maxCriticalX = 2;
            if (this.getChane(actorStats.luck, targetStats.luck)) {
                isCritical = true;
                criticalX = maxCriticalX + this.getValuePercent(actorStats.criticalX_, maxCriticalX);
            }

            /* Tính sát thương */
            let damage = GameHelper.convertToFloat(actorDamage * criticalX - targetResistance, 2);
            damage = damage <= 0 ? 0 : damage;
            this.showFadeText(scene, target.x, target.y, damage, isCritical, {
                color: damage == 0 ? '#ccc' : '#ff0008',
            });
            return damage;
        }
        return 0;
    }
}

export default GameHelper;
