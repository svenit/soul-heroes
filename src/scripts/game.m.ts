import config from './config';
import LoginScene from './scenes/login';
import { StatusBar } from '@capacitor/status-bar';

class MobileMode {
    constructor() {
        this.hideStatusBar();
    }
    async hideStatusBar() {
        await StatusBar.hide();
        StatusBar.setOverlaysWebView({ overlay: true });
        setInterval(() => {
            StatusBar.hide();
        }, 3000);
    }
}

(async () => {
    new MobileMode();
    new Phaser.Game(
        Object.assign(config, {
            scene: [LoginScene],
        }),
    );
})();
