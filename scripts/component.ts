class Component {
    consumption: number;

    current: number;
    maxCurrent: number;
    voltage: number;
    resistance: number;

    id: number;
    readonly type: number = -1;

    children: Array<Component>;

    hasFocus: boolean;
    hasFailed: boolean;

    constructor(maxCurrent: number, resistance: number) {
        this.current = 0;
        this.voltage = 0;
        this.maxCurrent = maxCurrent;
        this.resistance = resistance
        this.consumption = 0;

        this.type = 0;

        this.children = [];

        this.hasFocus = false;
        this.hasFailed = false;
    }

    drawFocus(ctx: any, locX: number, locY: number, size: number) {
        if(this.hasFocus) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.setLineDash([4]);
            ctx.beginPath();
            ctx.rect(locX, locY - size / 2, size, size);
            ctx.stroke();

            ctx.setLineDash([]);
        }
    }

    render(ctx: any, locX: number, locY: number, size: number) {
        this.drawFocus(ctx, locX, locY, size);
        this.renderChildren(ctx, locX, locY, size);

        if(this.hasFailed) {
            ctx = drawLine(ctx, locX, locY - size /2, locX + size, locY + size / 2, "orange")
            ctx = drawLine(ctx, locX, locY + size /2, locX + size, locY - size / 2, "orange")
        }
    }

    renderChildren(ctx: any, locX: number, locY: number, size: number) {
        if(this.children.length > 0) {
            //DRAWS WIRES
            ctx = drawLine(ctx, locX + size, locY, locX + size * 2, locY, 'red')
            ctx = drawLine(ctx, locX + size * 2, locY, locX + size * 2, locY + size * (this.children.length - 1), 'red')
            ctx = drawLine(ctx, locX + size * 3, locY, locX + size * 3, locY + size * (this.children.length - 1), 'red')

            //IF HAS CHILDRENS DRAWS THEM RECURSIVELY
            for(let i: number = 0; i < this.children.length; i++) {
                //CHILDS COORDINATES
                let childCoords: Array<number> = this.getChildCoords(locX, locY, size, i);

                this.children[i].render(ctx, childCoords[0], childCoords[1], size);
            }
        } 
    }

    findMaxChildren(currentMax: number) {
        if(currentMax < this.children.length) {
            currentMax = this.children.length;
        }

        for(let i: number = 0; i < this.children.length; i++) {
            let childrenMax: number = this.children[i].findMaxChildren(currentMax)
            if(childrenMax > currentMax) {
                currentMax = childrenMax; 
            }
        }
        return currentMax;
    }

    findLongestBranch(depth: number) {
        if(this.children.length == 0) {
            return depth;
        }

        for(let i: number = 0; i < this.children.length; i++) {
            let branchLenght: number = this.children[i].findLongestBranch(depth);
            if(branchLenght > depth) {
                depth = branchLenght
            }
        }
        return depth + 1;
    }

    getChildCoords(locX: number, locY: number, size: number, childNum: number) {
        return [locX + size * 2, locY + size * childNum]
    } 

    getComponentByCoords(componentX: number, componentY: number, componentSize: number, x: number, y: number) {
        if(componentX < x && componentX + componentSize > x && componentY - componentSize / 2 < y && componentY + componentSize / 2 > y) {
            return this;
        }

        for(let i: number = 0; i < this.children.length; i++) {
            //CHILDS COORDINATES
            let childCoords: Array<number> = this.getChildCoords(componentX, componentY, componentSize, i);

            let child: Component = this.children[i].getComponentByCoords(childCoords[0], childCoords[1], componentSize, x, y);
            //IF FINDS MATCH STOPS RECURSION
            if(child != null) {
                return child
            }
        }
        return null;
    }

    getDisplayName() {
        if(this.type == -1) return "Komponentti " + this.id.toString();
        if(this.type == 0) return "Virtalähde " + this.id.toString();
        if(this.type == 1) return "Lamppu " + this.id.toString();
        if(this.type == 2) return "Vastus " + this.id.toString();
        if(this.type == 3) return "Kytkin " + this.id.toString();
    }
}

class PowerSource extends Component {
    readonly type: number = 0;

    constructor(maxCurrent: number, resistance: number, voltage: number) {
        super(maxCurrent, resistance);
        this.voltage = voltage;
    }

    render(ctx: any, locX: number, locY: number, size: number) {
        //POWER SOURCE GRAPICHS
        ctx = drawLine(ctx, locX, locY, locX + size / 2 - 4, locY, 'black');
        ctx = drawLine(ctx, locX + size / 2 + 4, locY, locX + size, locY, 'black');
        ctx = drawLine(ctx, locX + size / 2 - 4, locY - size / 5, locX + size / 2 - 4, locY + size / 5, 'black');
        ctx = drawLine(ctx, locX + size / 2 + 4, locY - size / 2, locX + size / 2 + 4, locY + size / 2, 'black');

        super.render(ctx, locX, locY, size);
    }
}

class Lamp extends Component {
    readonly type: number = 1;

    render(ctx: any, locX: number, locY: number, size: number) {
        //LAMP BRIGHTNESS ACCORDING TO VOLTAGE
        let lampColor: string;
        if(this.hasFailed) {
            //IF CURRENT TOO HIGH, DISPLAY BROKEN LAMP
            lampColor = "gray";
        } else {
            let brightness: number = this.current / this.maxCurrent;
            lampColor = rgbToHex(255, 255 - brightness * 120, 255 * (1 - brightness));
        }
        ctx = drawCircle(ctx, locX + size / 2, locY, size / 2, lampColor, true)

        ctx = drawLine(ctx, locX, locY, locX + size / 4, locY, 'black');
        ctx = drawLine(ctx, locX + size - size / 4, locY, locX + size, locY, 'black');
        ctx = drawCircle(ctx, locX + size / 2, locY, size / 2)
        
        ctx = drawLine(ctx, locX + size / 3, locY - size / 6, locX + size - size / 3, locY + size / 6, 'black');
        ctx = drawLine(ctx, locX + size / 3, locY + size / 6, locX + size - size / 3, locY - size / 6, 'black');

        super.render(ctx, locX, locY, size);
    }
}

class Resistor extends Component {
    readonly type: number = 2;

    render(ctx: any, locX: number, locY: number, size: number) {
        //RESISTOR GRAPICHS
        ctx = drawLine(ctx, locX, locY, locX + size, locY, 'black');
        ctx.fillStyle = 'black';
        ctx.fillRect(locX + size / 4, locY - size / 6, size / 2, size / 3)
        ctx.fillStyle = 'white';
        ctx.fillRect(locX + size / 4 + 4, locY - size / 6 + 4, size / 2 - 8, size / 3 - 8)

        super.render(ctx, locX, locY, size);
    }
}

class Switch extends Component {
    readonly type: number = 3;

    offResistance: number;
    OnResistance: number;

    constructor(maxCurrent: number) {
        super(maxCurrent, 0);
        this.offResistance = Infinity;
        this.OnResistance = 0;

        this.turnOn();
    }

    render(ctx: any, locX: number, locY: number, size: number) {
        if(this.isOn()) {
            //IF SWITCH IS ON
            ctx = drawLine(ctx, locX, locY, locX + size, locY, "black")
            ctx = drawLine(ctx, locX + size / 4, locY, locX + size - size / 4, locY, "green")
        } else {
            //IF SWITCH IS OFF
            ctx = drawLine(ctx, locX, locY, locX + size / 4, locY, "black")
            ctx = drawLine(ctx, locX + size - size / 4, locY, locX + size, locY, "black")
            ctx = drawLine(ctx, locX + size / 4, locY, locX + size - size / 4, locY - size / 4, "black")
        }

        super.render(ctx, locX, locY, size);
    }

    turnOn() {
        this.resistance = this.OnResistance;
    }
    turnOff() {
        this.resistance = this.offResistance;
    }

    isOn() {
        if(this.resistance == this.OnResistance) {
            return true;
        }
        return false;
    }
}

class currentSensor extends Component {
    
}