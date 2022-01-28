import SceneManager from '../managers/scene';
import BaseScene from './base';
import packageJson from '../../../package.json';
import Modal from '../ui/modal';

class LoginScene extends BaseScene {
    /* Private */
    private _backgroundAudio: Phaser.Sound.BaseSound;
    private _sceneBackground: Phaser.GameObjects.Image;
    private _backDrop: Phaser.GameObjects.Image;
    private _loginText: Phaser.GameObjects.Text;
    private _loginTextAnimation: Phaser.Tweens.Tween;
    private _versionText: Phaser.GameObjects.Text;

    constructor() {
        super('LoginScene');
    }
    public preload() {
        this.load.image('backdrop', 'images/common/backdrop.png');
        this.load.image('login-background', 'images/background/splash3.png');
        this.load.audio('background-login-audio', 'audio/common/login.wav');
        this.handlePreload(this.load);
    }
    public create() {
        (new Modal(this, {
            title: 'THÔNG BÁO',
            content: [
                {
                    tag: 'p',
                    content: "[ 29/01/2022 - v1.0.5 ]",
                    classes: "mb-1",
                    children: [
                        {
                            tag: 'li',
                            content: 'Cập nhật bản đồ sự kiện mới'
                        },
                        {
                            tag: 'li',
                            content: 'Cập nhật sự kiện Tết 2022'
                        },
                    ]
                },
            ]
        })).open();
        this._backgroundAudio = this.sound.add('background-login-audio');
        this._backgroundAudio.play({
            loop: true,
        });
        const { width, height } = this.game.canvas;
        this._sceneBackground = this.add.image(width / 2, height / 2, 'login-background');
        this._sceneBackground.setDisplaySize(width, height);
        const centerX = width / 2;
        this._backDrop = this.add.image(centerX - 150, height - 70, 'backdrop');
        this._backDrop.setDisplaySize(width, 80);
        this._backDrop.setInteractive();
        this._backDrop.on('pointerdown', () => {
            this._backDrop.destroy();
            this._sceneBackground.destroy();
            this._loginText.destroy();
            this._versionText.destroy();
            this._loginTextAnimation.stop();
            this._backgroundAudio.destroy();
            SceneManager.navigate('lobby', this);
        });
        this._loginText = this.make.text({
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
        this._versionText = this.add.text(10, 10, packageJson.version, {
            fontFamily: 'Roboto',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 1,
        });
        this._loginTextAnimation = this.tweens.add({
            targets: this._loginText,
            alpha: 0,
            yoyo: true,
            delay: 100,
            loop: -1,
        });
        window.addEventListener('resize', () => {
            const { width, height } = this.game.canvas;
            if (this._sceneBackground) {
                this._sceneBackground.setPosition(width / 2, height / 2);
                this._sceneBackground.setDisplaySize(width, height);
            }
        });
    }
}

export default LoginScene;
