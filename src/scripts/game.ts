import config from './config';
import LobbyScene from './scenes/lobby';
import LoginScene from './scenes/login';

(async () => {
  new Phaser.Game(
    Object.assign(config, {
      scene: [LoginScene],
    }),
  );
})();
