import Phaser from 'phaser';
import GameConfig from './config/game';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'game',
  render: {
    antialiasGL: false,
    pixelArt: true,
  },
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        x: 0,
        y: 0,
      },
      debug: GameConfig.debug,
    },
  },
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.RESIZE,
  },
  disableContextMenu: true,
  fps: {
    target: 120,
    forceSetTimeOut: true,
  },
  banner: false,
  dom: {
    createContainer: true,
  },
};

console.warn = () => null;

export default config;
