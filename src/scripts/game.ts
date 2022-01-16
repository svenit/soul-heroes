import config from './config';
import LoginScene from './scenes/login';

(() => {
    new Phaser.Game(
        Object.assign(config, {
            scene: [LoginScene],
        }),
    );
})();
