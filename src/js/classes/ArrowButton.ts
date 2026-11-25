export class ArrowButton {
    
    public icon: HTMLDivElement;
    public button: HTMLButtonElement;
    public container: HTMLDivElement;
    public constructor(direction: number) {
        
        let icon = document.createElement('div'); {
            icon.classList.add('icon');
            icon.style.transform = `rotate(${135 + direction}deg) translate(-15%, -15%)`
        }
        
        let button = document.createElement('button'); {
            button.type = 'button'
        }
        
        let container = document.createElement('div'); {
            container.classList.add('arrow-container');
            container.appendChild(icon);
            container.appendChild(button);
        }
        
        this.icon = icon;
        this.button = button;
        this.container = container;
        
    }
    
    public create(parent: Node) {
        parent.appendChild(this.container);
        return this;
    }
    
    public setDirection(direction: number) {
        this.icon.style.transform = `rotate(${135 + direction}deg) translate(-15%, -15%)`
    }
    
    public toggle(toggle: boolean) {
        this.button.disabled = !toggle;
    }
    
}