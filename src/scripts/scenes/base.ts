import GameConfig from '../config/game';
import GameHelper from '../helpers/game';
import FpsText from '../helpers/fpsText';

class BaseScene extends Phaser.Scene {
    loadedFile = 0;
    preloadBackground: Phaser.GameObjects.Image;
    progressText: Phaser.GameObjects.Text;
    progressBarInner: Phaser.GameObjects.Graphics;
    progressBar: Phaser.GameObjects.Graphics;
    fpsText: FpsText;
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
    create() {
        this.fpsText = new FpsText(this);
    }
    update(time: number, delta: number): void {
        this.fpsText.update();
    }
    /**
     * @summary Hiển thị loading UI khi đang tải assets
     * @param {Phaser.Loader} loader
     */
    handlePreload(loader: any) {
        this.preloadBackground = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'splash');
        this.preloadBackground.setDisplaySize(window.innerWidth, window.innerHeight);
        loader.on('complete', () => {
            this.loadedFile = 0;
            this.progressBar && this.progressBar.clear();
            this.progressBarInner && this.progressBarInner.clear();
            this.progressText && this.progressText.destroy();
            this.preloadBackground && this.preloadBackground.destroy();
            if (!this.scale.isFullscreen && !this.sys.game.device.os.desktop && GameConfig.fullScreenMode) {
                this.scale.startFullscreen();
            }
        });
        loader.on('fileprogress', (_file: File, progress: number) => {
            progress == 1 && this.loadedFile++;
            const percentPerFile = 100 / loader.totalToLoad;
            const curentProgress = this.loadedFile * percentPerFile + progress;
            this.onPreloadAssets(curentProgress / 100);
        });
    }
    /**
     * @summary Vẽ UI cho thanh loading
     * @param {float} progress
     */
    onPreloadAssets(progress: number) {
        const totalPercent = 100;
        const progressBarHeight = 10;
        const progressBarWidth = 200;
        const { innerWidth, innerHeight } = window;
        const centerX = innerWidth / 2 - totalPercent;
        const currentProgress = GameHelper.convertToFloat(progress * totalPercent, 2);

        if (this.progressBar) this.progressBar.clear();
        if (this.progressBarInner) this.progressBarInner.clear();

        this.progressBarInner = this.add.graphics();
        this.progressBarInner.fillStyle(0x000, 0.8);
        this.progressBarInner.fillRect(centerX, innerHeight - 40, progressBarWidth, progressBarHeight);

        this.progressBar = this.add.graphics();
        this.progressBar.fillStyle(0xffffff, 1);
        this.progressBar.fillRect(centerX, innerHeight - 40, progress * progressBarWidth, progressBarHeight);

        if (!this.progressText) {
            this.progressText = this.make.text({
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
        this.progressText.setText(`${isLoadComplete ? 100 : currentProgress}%`);
        if (isLoadComplete) {
            this.progressBar.clear();
            this.progressBarInner.clear();
            this.progressText.destroy();
        }
    }
}

export default BaseScene;
