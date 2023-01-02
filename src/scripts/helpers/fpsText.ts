import { Scene } from '../types/global';

export default class FpsText extends Phaser.GameObjects.Text {
  constructor(scene: Scene) {
    super(scene, 10, 10, '', {
      color: '#fff',
      fontSize: '24px',
      stroke: '#000',
      strokeThickness: 6,
      fontFamily: 'PixelSan',
    });
    scene.add.existing(this);
    this.setDepth(999);
    this.setScrollFactor(0);
    this.setOrigin(0);
  }

  public update() {
    this.setText(`FPS: ${Math.floor(this.scene.game.loop.actualFps)}`);
  }
}
