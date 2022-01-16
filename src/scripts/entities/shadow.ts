import { Scene } from "../types/global";

class Shadow {
    name = 'shadow';
    scene: Scene;
    isInit = false;
    owner: Phaser.GameObjects.Sprite;
    shadow: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

    constructor(scene: Scene, owner: Phaser.GameObjects.Sprite) {
        this.scene = scene;
        this.owner = owner;
        this.init();
    }
    async init() {
        const { x, y, height } = this.owner;
        this.shadow = this.scene.physics.add.image(x - 1, y + height - height / 2 + 2, this.name);
        this.shadow.body.setSize(0.1, 0.1);
        this.shadow.setScale(0.5);
        this.isInit = true;
    }
    /**
     * @summary Di chuyển bóng theo actor
     */
    onFollowedMove() {
        const { x, y, height, body } = this.owner;
        if (this.shadow) {
            this.shadow.body.setVelocity(body.velocity.x, body.velocity.y);
            this.shadow.setPosition(x - 1, y + height - height / 2 + 2);
        }
    }
    resetState() {
        if (this.isInit) {
            this.shadow && this.shadow.body.setVelocity(0);
        }
    }
    destroy() {
        this.shadow && this.shadow.destroy();
    }
}

export default Shadow;
