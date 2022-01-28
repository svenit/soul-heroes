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


    constructor(scene: Scene, owner: Actor, options: BarOptions = {}) {
        super(scene);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.owner = owner;
        this.percentWidth = 40;
        this.total = options.total ?? 0;
        this.remain = options.remain ?? options.total ?? 0;
        this._draw();
        // @ts-ignore
        this.body.setSize(0.1, 0.1);
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
        this._draw();
        const isDied = this.remain <= 0;
        return isDied;
    }
    /**
     * @summary Vẽ thanh bar
     */
    private _draw() {
        const x = this.x - 22;
        const y = this.y - 32;
        const remain = Math.floor((this.remain / this.total) * this.percentWidth);
        this.clear();
        this.fillStyle(0x000000);
        this.fillRect(x, y, this.percentWidth + 4, 6);
        this.fillStyle(0xffffff);
        this.fillRect(x + 2, y + 2, this.percentWidth, 2);
        this.fillStyle(remain < 10 ? 0xff0000 : 0x00ff00);
        this.fillRect(x + 2, y + 2, remain, 2);
    }
}

export default Bar;
