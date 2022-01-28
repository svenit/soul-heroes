import { HTMLDOMInterface } from "../types/ui";

class DOM {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }
    public makeHTML(content: HTMLDOMInterface[] = []) {
        return content.map((_content: HTMLDOMInterface) => {
            const { tag, style = '', classes = '', content = '', attributes, children } = _content;
            const childrenLoop = children ? this.makeHTML(children) : '';
            let attributesFormatted = '';
            attributes ? Object.entries(attributes).forEach(([key, value]) => {
                attributesFormatted += `${key}="${value}"`;
            }) : '';
            return `<${tag} ${attributesFormatted} style="${style}" class="${classes}">${content}${childrenLoop}</${tag}>`
        }).join('');
    }
}

export default DOM;