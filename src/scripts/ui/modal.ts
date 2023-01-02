import { Scene } from '../types/global';
import { ModalInterface } from '../types/ui';
import DOM from './dom';

class Modal extends DOM {
  public scence: Scene;
  public modalDOM: Phaser.GameObjects.DOMElement;
  public options: ModalInterface = {
    title: '',
    content: [],
  };

  constructor(scence: Scene, options: ModalInterface = {}) {
    super('Modal');
    this.scence = scence;
    this.options = Object.assign(this.options, options);
  }
  public open() {
    const { width, height } = this.scence.game.canvas;
    const { title, content, onClose } = this.options;
    const contentFormatted = this.makeHTML(content);
    const modalContent = this.makeHTML([
      {
        tag: 'div',
        classes: 'dimmed-bg w-full h-full',
        attributes: {
          dataAction: 'closeModal',
        },
        children: [
          {
            tag: 'div',
            classes: 'px-2 basic-modal animate__animated animate__fadeInDown',
            children: [
              {
                tag: 'img',
                classes: 'basic-modal-close',
                attributes: {
                  dataAction: 'closeModal',
                  src: 'images/common/ui/close-btn.png',
                },
              },
              {
                tag: 'div',
                classes: 'basic-modal-title text-white text-center my-1',
                content: title,
              },
              {
                tag: 'div',
                classes: 'p-2 basic-modal-content',
                content: contentFormatted,
              },
            ],
          },
        ],
      },
    ]);
    this.modalDOM = this.scence.add.dom(width / 2, height / 2).createFromHTML(modalContent);
    this.modalDOM.setDepth(99999999999);
    this.modalDOM.setScrollFactor(0);
    this.modalDOM.addListener('click').on('click', (event) => {
      const [selectElement] = event.path;
      if (selectElement.hasAttribute('dataAction')) {
        const actionsMap = {
          closeModal: () => {
            this.modalDOM.destroy();
          },
        };
        const action = selectElement.getAttribute('dataAction');
        if (action == 'closeModal' && onClose) onClose();
        actionsMap[action]();
      }
    });
  }
  public close() {
    this.modalDOM && this.modalDOM.removeElement();
  }
}

export default Modal;
