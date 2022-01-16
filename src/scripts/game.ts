import config from './config';
import LoginScene from './scenes/login';

(async () => {
    new Phaser.Game(
        Object.assign(config, {
            scene: [LoginScene],
        }),
    );
})();
