export class ArrowButton {
    icon;
    button;
    container;
    constructor(direction) {
        let icon = document.createElement('div');
        {
            icon.classList.add('icon');
            icon.style.transform = `rotate(${135 + direction}deg) translate(-15%, -15%)`;
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
        this.icon = icon;
        this.button = button;
        this.container = container;
    }
    create(parent) {
        parent.appendChild(this.container);
        return this;
    }
    setDirection(direction) {
        this.icon.style.transform = `rotate(${135 + direction}deg) translate(-15%, -15%)`;
    }
    toggle(toggle) {
        this.button.disabled = !toggle;
        this.container.classList.toggle('enabled', toggle);
    }
}
