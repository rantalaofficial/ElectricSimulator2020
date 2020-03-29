//HELPER FUNCTIONS
function drawLine(ctx: any, x1: number, y1: number, x2: Number, y2: number, color: string, lineWidth = 4) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke(); 
    return ctx;
}
function drawCircle(ctx: any, centerX: number, centerY: number, radius: number, color: string = "black", filled: boolean = false) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI);
    if(filled) ctx.fill();
    ctx.stroke(); 
    return ctx;
}
function rgbToHex(r: number, g: number, b: number) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b)

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function fixPossibleNan(n: number) {
    if(isNaN(n)) {
        return 0;
    }
    return n;
}
declare interface ObjectConstructor {
    assign(...objects: Object[]): Object;
}
//ALLOWS TWO CLASS INTANCES TO BE MERGED TOGETHER WITH FUNCTIONS
function forceAssignInstances(source: Object, target: Object) {
    for(let prop in source) {
        if(source.hasOwnProperty(prop)) {
            target[prop] = source[prop]
        }
    }
    //RETURN COPY OF TARGET
    return Object.assign(Object.create(Object.getPrototypeOf(target)), target);;
}

interface componentCallBack {
    (component: Component): void;
}

class Circuit {
    private ctx: any;
    rootComponent: Component;

    locX: number;
    locY: number;
    readonly componentSize: number;
    lastComponentId: number;

    resistance: number;
    current: number;

    hasFailed: boolean;

    constructor(ctx: any, locX: number, locY: number, componentSize: number) {
        this.ctx = ctx;
        
        this.locX = locX;
        this.locY = locY;
        this.componentSize = componentSize;

        this.rootComponent = new PowerSource(2, 0, 1);
        this.rootComponent.id = 0;
        this.lastComponentId = 0;

        this.resistance = 0;
        this.current = 0;

        this.hasFailed = false;
    }

    //THIS FUNCTION RE-INITIALIZES ALL CIRCUIT COMPONENTS AND ADDS CLASS FUNCTIONS
    reInitialize(circuitData: Circuit) {
        circuit.rootComponent = <Component>forceAssignInstances(circuitData.rootComponent, new PowerSource(0, 0, 0))
        this.reInitializeChildren(circuit.rootComponent);
    }

    reInitializeChildren(parent: Component) {
        if(parent.children.length > 0) {
            for(let i: number = 0; i < parent.children.length; i++) {
                parent.children[i] = this.reInitializeChildren(parent.children[i])
                
            }
        }
        if(this.componentIsRoot(parent.id)) {
            return parent;
        }

        let emptyComponent: Component;
        if(parent.type == 0) {
            emptyComponent = new PowerSource(0, 0, 0);
        } else if(parent.type == 1) {
            emptyComponent = new Lamp(0, 0);
        } else if(parent.type == 2) {
            emptyComponent = new Resistor(0, 0);
        } else if(parent.type == 3) {
            emptyComponent = new Switch(0);
            //JSON CONVERTS INFINITY TO NULL SO FIXES THAT        
            (<Switch>parent).offResistance = (<Switch>emptyComponent).offResistance;
            if((<Switch>parent).resistance == null) {
                (<Switch>parent).resistance = (<Switch>parent).offResistance
            }
        } else {
            emptyComponent = new Component(0, 0);
        }
        //REMOVE FOCUS FROM ALL ELEMENTS
        parent.hasFocus = false;
        //ASSIGN NEW IDS
        this.lastComponentId++;
        parent.id = this.lastComponentId;
        //RE-INITIALIZES INSTANCES
        return <Component>forceAssignInstances(parent, emptyComponent);
    }

    render() {
        //DRAWS WIRES COMPLETING CIRCUIT
        let width: number = (this.rootComponent.findLongestBranch(1) * 2 - 1) * this.componentSize;
        let height: number = this.rootComponent.findMaxChildren(1) * this.componentSize;

        this.ctx = drawLine(this.ctx, this.locX, this.locY, this.locX, this.locY + height, 'red');  
        this.ctx = drawLine(this.ctx, this.locX, this.locY + height, this.locX + width, this.locY + height, 'red');
        this.ctx = drawLine(this.ctx, this.locX + width, this.locY, this.locX + width, this.locY + height, 'red');

        this.rootComponent.render(this.ctx, this.locX, this.locY, this.componentSize);
    }

    componentIsRoot(componentId: number) {
        if(componentId == 0) {
            return true;
        }
        return false;
    }

    getComponentByCoords(x: number, y: number) {
        return this.rootComponent.getComponentByCoords(this.locX, this.locY, this.componentSize, x, y);
    }

    getComponentById(componentId: number, firstComponent = this.rootComponent) {
        if(firstComponent.id == componentId) {
            return firstComponent;
        } 

        //RECURSIVELY FINDS MACTHING ID
        let matchingComponent: Component;
        for(let i: number = 0; i < firstComponent.children.length; i++) {
            matchingComponent = this.getComponentById(componentId, firstComponent.children[i])
            if(matchingComponent != null) {
                return matchingComponent;
            }
        }

        return null;
    }

    getComponentParentById(componentId: number, firstComponent = this.rootComponent) {
        //RECURSIVELY FINDS MACTHING ID
        let matchingComponent: Component;
        for(let i: number = 0; i < firstComponent.children.length; i++) {
            if(firstComponent.children[i].id == componentId) {
                return firstComponent;
            } else {
                matchingComponent = this.getComponentParentById(componentId, firstComponent.children[i]);
                if(matchingComponent != null) {
                    return matchingComponent;
                }
            }
        }
        return null;
    }

    resetConsumption() {
        this.rootComponent.consumption = 0;
        this.forEachRootComponentInTree((component) => {
            for(let i: number; i < component.children.length; i++) {
                component.children[i].consumption = 0;
            }
        })
    }

    getLastComponentId() {
        //FINDS LAST COMPONENT
        let lastComponent: Component = this.rootComponent;

        while(lastComponent.children.length != 0) {
            lastComponent = lastComponent.children[0];
        }
        return lastComponent.id;
    }

    addComponent(parentId: number, component: Component) {
        let parentComponent: Component = this.getComponentById(parentId);
        if(parentComponent == null) {
            return;
        }

        this.lastComponentId++;
        component.id = this.lastComponentId;

        parentComponent.children.push(component)
    }

    deleteComponent(componentId: number) {
        let parentComponent: Component = this.getComponentParentById(componentId);
        for(let i = 0; i < parentComponent.children.length; i++) {
            if(parentComponent.children[i].id == componentId) {
                let componentChildren: Array<Component> = parentComponent.children[i].children;

                //REMOVES COMPONENT
                parentComponent.children = parentComponent.children.slice(0, i).concat(parentComponent.children.slice(i + 1));

                //IF REMOVED COMPONENT HAD CHILDREN, ADDS THEM TO PARENT COMPONENT
                if(componentChildren.length > 0) {
                    if(parentComponent.children.length > 0) {
                        parentComponent.children[0].children = componentChildren
                    } else {
                        parentComponent.children = componentChildren;
                    }
                }
                return true;
            }
        }
        return false;
    }

    forEachRootComponentInTree(callback: componentCallBack) {
        let currentComponent: Component = this.rootComponent;
        while(currentComponent.children.length != 0) {
            callback(currentComponent);
            currentComponent = currentComponent.children[0];
        }
    }

    simulate(time: number) {
        if(time == 0) {
            this.current = 0;
        }
        
        //RESET CIRCUIT INFO
        this.hasFailed = false

        //CALCULATE RESISTANCE
        this.resistance = this.rootComponent.resistance;

        let parallelResistances: Array<number> = [];
        let parallelResistance: number;

        this.forEachRootComponentInTree((currentComponent) => {
            //CALCULATE PARALLEL RESISTANCE
            parallelResistance = 0;
            for(let i: number = 0; i < currentComponent.children.length; i++) {
                parallelResistance += 1 / currentComponent.children[i].resistance;
            }
            parallelResistance = (1 / parallelResistance);

            parallelResistances.push(parallelResistance);
            this.resistance += (parallelResistance)
        })

        //CALCULATE

        this.current = this.rootComponent.voltage / this.resistance;
        //CALCULATE ALL COMPONENTS VOLTAGES, CURRENT, CONSUMPTION
        let parallelVoltages: Array<number> = [];
        for(let i: number = 0; i < parallelResistances.length; i++) {
            parallelVoltages.push(fixPossibleNan(parallelResistances[i] * this.current));
        }

        let componentDepth: number = 0;
        this.forEachRootComponentInTree((currentComponent) => {
            for(let i: number = 0; i < currentComponent.children.length; i++) {
                currentComponent.children[i].voltage = parallelVoltages[componentDepth]
                currentComponent.children[i].current = fixPossibleNan(parallelVoltages[componentDepth] / currentComponent.children[i].resistance);

                currentComponent.children[i].hasFailed = false;
                if(currentComponent.children[i].current > currentComponent.children[i].maxCurrent) {
                    //IF COMPONENT CURRENT IS HIGHER THAN MAX CURRENT, CIRCUIT FAILED FLAG IS TRUE
                    currentComponent.children[i].hasFailed = true;
                    this.hasFailed = true;
                } 

                currentComponent.children[i].consumption += currentComponent.children[i].voltage * currentComponent.children[i].current * time;       
            }
            componentDepth++;
        });

        //UPDATE ROOT COMPONENT AND CHECK FOR FAILURE
        this.rootComponent.hasFailed = false;
        this.rootComponent.current = this.current;
        if(this.rootComponent.current > this.rootComponent.maxCurrent) {
            this.rootComponent.hasFailed = true;
            this.hasFailed = true;
        }

        this.rootComponent.consumption += this.rootComponent.voltage * this.current * time;
    }
}

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