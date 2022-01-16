import { Scene } from "../types/global";

interface BarOptions {
    total?: number;
    remain?: number;
}

class Bar extends Phaser.GameObjects.Graphics {
    owner: Phaser.GameObjects.Sprite;
    percentWidth: number;
    total: number = 0;
    remain: number = 0;
    private _x: number;
    private _y: number;

    constructor(scene: Scene, x: number, y: number, owner: Phaser.GameObjects.Sprite, options: BarOptions = {}) {
        super(scene);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.owner = owner;
        this.percentWidth = 40;
        this.total = options.total ?? 0;
        this.remain = options.remain ?? options.total ?? 0;
        this.draw();
        this._x = x - 22;
        this._y = y - 35;
        // @ts-ignore
        this.body.setSize(0.1, 0.1);
        this.setPosition(this._x, this._y);
        this.setDepth(5);
    }
    /**
     * @summary Giảm bar
     * @param {number} amount
     * @returns {bool} isDied
     */
    decrease(amount: number): boolean {
        this.remain -= Number(amount);
        if (this.remain < 0) {
            this.remain = 0;
        }
        const { x, y } = this.owner;
        this.x = x;
        this.y = y;
        this.draw();
        this.setPosition(x - 22 - this.x, y - 35 - this.y);
        const isDied = this.remain <= 0;
        return isDied;
    }
    /**
     * @summary Vẽ thanh bar
     */
    draw() {
        const remain = Math.floor((this.remain / this.total) * this.percentWidth);
        this.clear();
        this.fillStyle(0x000000);
        this.fillRect(this.x, this.y, this.percentWidth + 4, 6);
        this.fillStyle(0xffffff);
        this.fillRect(this.x + 2, this.y + 2, this.percentWidth, 2);
        this.fillStyle(remain < 10 ? 0xff0000 : 0x00ff00);
        this.fillRect(this.x + 2, this.y + 2, remain, 2);
    }
    /**
     * @summary Di chuyển thanh bar theo actor
     * @param {Phaser.GameObjects.Sprite} owner
     */
    onFollowedMove(owner: Phaser.GameObjects.Sprite) {
        const { body, x, y } = owner;
        this.x = x;
        this.y = y;
        this.draw();
        this.setPosition(x - 22 - this.x, y - 35 - this.y);
        // @ts-ignore
        this.body.setVelocity(body.velocity.x, body.velocity.y);
    }
    resetState() {
        // @ts-ignore
        this.body.setVelocity(0);
    }
    destroy() {
        super.destroy();
    }
}

export default Bar;
