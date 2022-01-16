import GameConfig from '../config/game';
import FpsText from '../helpers/fpsText';
import GameHelper from '../helpers/game';
class BaseScene extends Phaser.Scene {
    /* Private */
    private _loadedFile = 0;
    private _preloadBackground: Phaser.GameObjects.Image;
    private _progressText: Phaser.GameObjects.Text;
    private _progressBarInner: Phaser.GameObjects.Graphics;
    private _progressBar: Phaser.GameObjects.Graphics;
    private _fpsText: FpsText;
    /**
     * @param {string} name
     */
    constructor(key: string) {
        super({
            key,
            pack: {
                files: [
                    {
                        type: 'image',
                        key: 'splash',
                        url: 'images/background/splash.png',
                    },
                ],
            },
        });
    }
    public create() {
        if (GameConfig.showFps) this._fpsText = new FpsText(this);
    }
    public update(time: number, delta: number): void {
        this._fpsText && this._fpsText.update();
    }
    /**
     * @summary Hiển thị loading UI khi đang tải assets
     * @param {Phaser.Loader} loader
     */
    public handlePreload(loader: Phaser.Loader.LoaderPlugin) {
        this._preloadBackground = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'splash');
        this._preloadBackground.setDisplaySize(window.innerWidth, window.innerHeight);
        loader.on('complete', () => {
            this._loadedFile = 0;
            this._progressBar && this._progressBar.clear();
            this._progressBarInner && this._progressBarInner.clear();
            this._progressText && this._progressText.destroy();
            this._preloadBackground && this._preloadBackground.destroy();
            if (!this.scale.isFullscreen && !this.sys.game.device.os.desktop && GameConfig.fullScreenMode) {
                this.scale.startFullscreen();
            }
        });
        loader.on('fileprogress', (_file: File, progress: number) => {
            progress == 1 && this._loadedFile++;
            const percentPerFile = 100 / loader.totalToLoad;
            const curentProgress = this._loadedFile * percentPerFile + progress;
            this._onPreloadAssets(curentProgress / 100);
        });
    }
    /**
     * @summary Vẽ UI cho thanh loading
     * @param {float} progress
     */
    private _onPreloadAssets(progress: number) {
        const totalPercent = 100;
        const progressBarHeight = 10;
        const progressBarWidth = 200;
        const { innerWidth, innerHeight } = window;
        const centerX = innerWidth / 2 - totalPercent;
        const currentProgress = GameHelper.convertToFloat(progress * totalPercent, 2);

        if (this._progressBar) this._progressBar.clear();
        if (this._progressBarInner) this._progressBarInner.clear();

        this._progressBarInner = this.add.graphics();
        this._progressBarInner.fillStyle(0x000, 0.8);
        this._progressBarInner.fillRect(centerX, innerHeight - 40, progressBarWidth, progressBarHeight);

        this._progressBar = this.add.graphics();
        this._progressBar.fillStyle(0xffffff, 1);
        this._progressBar.fillRect(centerX, innerHeight - 40, progress * progressBarWidth, progressBarHeight);

        if (!this._progressText) {
            this._progressText = this.make.text({
                x: centerX + totalPercent - 15,
                y: innerHeight - 75,
                text: '0',
                style: {
                    font: '30px PixelVi',
                    color: '#ffffff',
                    stroke: '#000',
                    strokeThickness: 4,
                },
            });
        }
        const isLoadComplete = currentProgress >= 100;
        this._progressText.setText(`${isLoadComplete ? 100 : currentProgress}%`);
        if (isLoadComplete) {
            this._progressBar.clear();
            this._progressBarInner.clear();
            this._progressText.destroy();
        }
    }
}

export default BaseScene;
