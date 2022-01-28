export interface HTMLDOMInterface {
    tag?: string;
    content?: string;
    style?: string;
    classes?: string;
    attributes?: {
        [key: string]: string
    };
    children?: HTMLDOMInterface[];
}

export interface ModalInterface {
    title?: string;
    content?: HTMLDOMInterface[];
    onClose?: () => void;
}
