import { Scene } from '../types/global';

class Shadow {
    public name = 'shadow';
    public isInit = false;
    public scene: Scene;
    public owner: Phaser.GameObjects.Sprite;
    public shadow: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

    constructor(scene: Scene, owner: Phaser.GameObjects.Sprite) {
        this.scene = scene;
        this.owner = owner;
        this._init();
    }
    private async _init() {
        const { x, y, height } = this.owner;
        this.shadow = this.scene.physics.add.image(x - 1, y + height - height / 2 + 2, this.name);
        this.shadow.body.setSize(0.1, 0.1);
        this.shadow.setScale(0.5);
        this.isInit = true;
    }
    /**
     * @summary Di chuyển bóng theo actor
     */
    public onFollowedMove() {
        const { x, y, height, body } = this.owner;
        if (this.shadow) {
            this.shadow.body.setVelocity(body.velocity.x, body.velocity.y);
            this.shadow.setPosition(x - 1, y + height - height / 2 + 2);
        }
    }
    public resetState() {
        if (this.isInit) {
            this.shadow && this.shadow.body.setVelocity(0);
        }
    }
    public destroy() {
        this.shadow && this.shadow.destroy();
    }
}

export default Shadow;
