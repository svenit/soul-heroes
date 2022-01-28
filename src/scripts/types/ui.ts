export interface ModalContentInterface {
    tag?: string;
    content?: string;
    style?: string;
    class?: string;
    children?: ModalContentInterface[];
}

export interface ModalInterface {
    title?: string;
    content?: ModalContentInterface[];
    onClose?: () => void;
}
