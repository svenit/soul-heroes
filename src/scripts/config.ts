import Phaser from 'phaser';
import GameConfig from './config/game';

export default {
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
    },
    disableContextMenu: true,
    fps: {
        target: 240,
        forceSetTimeOut: true,
    },
    banner: false,
};
