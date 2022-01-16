import SceneManager from '../managers/scene';
import BaseScene from './base';
import packageJson from '../../../package.json';

class LoginScene extends BaseScene {
    backgroundAudio: Phaser.Sound.BaseSound;
    sceneBackground: Phaser.GameObjects.Image;
    backDrop: Phaser.GameObjects.Image;
    loginText: Phaser.GameObjects.Text;
    loginTextAnimation: Phaser.Tweens.Tween;
    versionText: Phaser.GameObjects.Text;

    constructor() {
        super('LoginScene');
    }
    preload() {
        this.load.image('backdrop', 'images/common/backdrop.png');
        this.load.image('login-background', 'images/background/splash3.png');
        this.load.audio('background-login-audio', 'audio/common/login.wav');
        this.handlePreload(this.load);
    }
    create() {
        this.backgroundAudio = this.sound.add('background-login-audio');
        this.backgroundAudio.play({
            loop: true,
        });
        const { width, height } = this.game.canvas;
        this.sceneBackground = this.add.image(width / 2, height / 2, 'login-background');
        this.sceneBackground.setDisplaySize(width, height);
        const centerX = width / 2;
        this.backDrop = this.add.image(centerX - 150, height - 70, 'backdrop');
        this.backDrop.setDisplaySize(width, 80);
        this.backDrop.setInteractive();
        this.backDrop.on('pointerdown', () => {
            this.backDrop.destroy();
            this.sceneBackground.destroy();
            this.loginText.destroy();
            this.versionText.destroy();
            this.loginTextAnimation.stop();
            this.backgroundAudio.destroy();
            SceneManager.navigate('lobby', this);
        });
        this.loginText = this.make.text({
            x: centerX - 100,
            y: height - 95,
            text: 'BẮT ĐẦU NGAY',
            style: {
                font: '35px PixelSan',
                color: '#ffffff',
                stroke: '#000',
                strokeThickness: 6,
            },
        });
        this.versionText = this.add.text(10, 10, packageJson.version, {
            fontFamily: 'Roboto',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 1
        });
        this.loginTextAnimation = this.tweens.add({
            targets: this.loginText,
            alpha: 0,
            yoyo: true,
            delay: 100,
            loop: -1,
        });
        window.addEventListener('resize', () => {
            const { width, height } = this.game.canvas;
            if (this.sceneBackground) {
                this.sceneBackground.setPosition(width / 2, height / 2);
                this.sceneBackground.setDisplaySize(width, height);
            }
        });
    }
    update() {}
}

export default LoginScene;
