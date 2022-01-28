import { Scene } from '../types/global';

type Options = {
    x: number;
    y: number;
    scale: number;
};

class Shadow extends Phaser.GameObjects.Image {
    public name = 'shadow';
    public scene: Scene;

    constructor(scene: Scene, options: Options = { x: 0, y: 0, scale: 0.5 }) {
        super(scene, options.x, options.y, 'shadow');
        this.scene = scene;
        this.scene.add.existing(this);
        this.setScale(options.scale);
        this.setOrigin(0.5, 0.5);
        this.setDepth(1);
    }
}

export default Shadow;
