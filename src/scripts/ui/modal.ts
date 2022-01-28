import { Scene } from '../types/global';
import { ModalContentInterface, ModalInterface } from '../types/ui';

class Modal {
    public scence: Scene;
    public modalDOM: Phaser.GameObjects.DOMElement;
    public options: ModalInterface = {
        title: '',
        content: [],
    };

    constructor(scence: Scene, options: ModalInterface = {}) {
        this.scence = scence;
        this.options = Object.assign(this.options, options);
    }
    public open() {
        const { width, height } = this.scence.game.canvas;
        const { title, content, onClose } = this.options;
        // @ts-ignore
        const contentFormatted = this._makeModalContent(content);
        this.modalDOM = this.scence.add.dom(width / 2, height / 2).createFromHTML(`
            <div data-action="close-modal" class="dimmed-bg w-full h-full">
                <div class="px-2 basic-modal">
                    <img data-action="close-modal" class="basic-modal-close" src="images/common/ui/close-btn.png">
                    <div class="basic-modal-title text-white text-center my-1">
                        ${title}
                    </div>
                    <div class="p-2 basic-modal-content">
                        ${contentFormatted}
                    </div>
                </div>
            </div>
        `);
        this.modalDOM.setDepth(99999999999);
        this.modalDOM.setScrollFactor(0);
        this.modalDOM.addListener('click').on('click', (event) => {
            const [selectElement] = event.path;
            if (selectElement.hasAttribute('data-action')) {
                const actionsMap = {
                    'close-modal': this.modalDOM.removeElement(),
                };
                const action = selectElement.getAttribute('data-action');
                if (action == 'close-modal' && onClose) onClose();
                actionsMap[action];
            }
        });
    }
    public close() {
        this.modalDOM && this.modalDOM.removeElement();
    }
    private _makeModalContent(content = []) {
        return content.map((c: ModalContentInterface) => {
            // @ts-ignore
            const children = c.children ? this._makeModalContent(c.children) : '';
            return `<${c.tag}>${c.content}${children}</${c.tag}>`
        }).join('');
    }
}

export default Modal;
