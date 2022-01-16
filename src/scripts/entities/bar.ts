import { Actor } from "../types/actor";
import { Scene } from "../types/global";

interface BarOptions {
    total?: number;
    remain?: number;
}

class Bar extends Phaser.GameObjects.Graphics {
    public owner: Actor;
    public percentWidth: number;
    public total: number = 0;
    public remain: number = 0;

    /* Private */
    private _x: number;
    private _y: number;

    constructor(scene: Scene, x: number, y: number, owner: Actor, options: BarOptions = {}) {
        super(scene);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.owner = owner;
        this.percentWidth = 40;
        this.total = options.total ?? 0;
        this.remain = options.remain ?? options.total ?? 0;
        this._draw();
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
    public decrease(amount: number): boolean {
        this.remain -= Number(amount);
        if (this.remain < 0) {
            this.remain = 0;
        }
        const { x, y } = this.owner;
        this.x = x;
        this.y = y;
        this._draw();
        this.setPosition(x - 22 - this.x, y - 35 - this.y);
        const isDied = this.remain <= 0;
        return isDied;
    }
    /**
     * @summary Vẽ thanh bar
     */
    private _draw() {
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
    public onFollowedMove(owner: Phaser.GameObjects.Sprite) {
        const { body, x, y } = owner;
        this.x = x;
        this.y = y;
        this._draw();
        this.setPosition(x - 22 - this.x, y - 35 - this.y);
        // @ts-ignore
        this.body.setVelocity(body.velocity.x, body.velocity.y);
    }
    public resetState() {
        // @ts-ignore
        this.body.setVelocity(0);
    }
}

export default Bar;
