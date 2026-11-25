export class ArrowButton {
    arrow;
    button;
    container;
    constructor(direction) {
        let icon = document.createElement('div');
        {
            icon.classList.add('icon');
            icon.style.transform = `rotate(${135 + direction}deg) translate(-20%, -20%)`;
        }
        let button = document.createElement('button');
        {
            button.type = 'button';
        }
        let container = document.createElement('div');
        {
            container.classList.add('arrow-container');
            container.appendChild(icon);
            container.appendChild(button);
        }
        this.arrow = icon;
        this.button = button;
        this.container = container;
    }
    create(parent) {
        parent.appendChild(this.container);
        return this;
    }
}
