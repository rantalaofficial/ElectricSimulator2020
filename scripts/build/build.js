var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//HELPER FUNCTIONS
function getElement(id) {
    return document.getElementById(id);
}
function getDecimal(decimal) {
    return (Math.round(decimal * 100) / 100).toString();
}
//WINDOW
var mainWindow = getElement("mainWindow");
var mainCtx = mainWindow.getContext("2d");
var simulationTime = 0;
//CAMERA
var cameraX = 0;
var cameraY = 0;
function render() {
    //DRAW BACKGROUND GRID PATTERN
    var gridSize = 30;
    var grdiStartX = cameraX % gridSize - gridSize;
    var grdiStartY = cameraY % gridSize - gridSize;
    for (var y = grdiStartY; y <= mainWindow.height + gridSize; y += gridSize) {
        for (var x = grdiStartX; x <= mainWindow.width + gridSize; x += gridSize) {
            mainCtx.fillStyle = "lightgray";
            mainCtx.fillRect(x, y, gridSize, gridSize);
            mainCtx.fillStyle = "white";
            mainCtx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
        }
    }
    //CAMERA LOCATION TEXT
    mainCtx.fillStyle = "black";
    mainCtx.font = "12px Arial";
    mainCtx.fillText("(" + cameraX.toString() + ", " + cameraY.toString() + ")", 5, 20);
    circuit.locX = 100 + cameraX;
    circuit.locY = 100 + cameraY;
    circuit.render();
}
function simulationTick() {
    circuit.simulate(0.1);
    render();
    //IF CIRCUIT FAILED, STOPS SIMULATION
    if (circuit.hasFailed) {
        stopSimulation();
    }
    //UPDATE GUI
    updateComponentInfoDiv(selectedComponent);
    getElement("simTimeText").innerHTML = getDecimal(simulationTime) + " s";
    getElement("circuitResistanceText").innerHTML = getDecimal(circuit.resistance) + " Ω";
    getElement("circuitCurrentText").innerHTML = getDecimal(circuit.current) + " A";
    simulationTime += 0.1;
}
var circuit = new Circuit(mainCtx, 100, 100, 50);
//HELPER FUNCTIONS
function drawLine(ctx, x1, y1, x2, y2, color, lineWidth) {
    if (lineWidth === void 0) { lineWidth = 4; }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return ctx;
}
function drawCircle(ctx, centerX, centerY, radius, color, filled) {
    if (color === void 0) { color = "black"; }
    if (filled === void 0) { filled = false; }
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI);
    if (filled)
        ctx.fill();
    ctx.stroke();
    return ctx;
}
function rgbToHex(r, g, b) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function fixPossibleNan(n) {
    if (isNaN(n)) {
        return 0;
    }
    return n;
}
//ALLOWS TWO CLASS INTANCES TO BE MERGED TOGETHER WITH FUNCTIONS
function forceAssignInstances(source, target) {
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
            target[prop] = source[prop];
        }
    }
    //RETURN COPY OF TARGET
    return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    ;
}
var Circuit = /** @class */ (function () {
    function Circuit(ctx, locX, locY, componentSize) {
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
    Circuit.prototype.reInitialize = function (circuitData) {
        circuit.rootComponent = forceAssignInstances(circuitData.rootComponent, new PowerSource(0, 0, 0));
        this.reInitializeChildren(circuit.rootComponent);
    };
    Circuit.prototype.reInitializeChildren = function (parent) {
        if (parent.children.length > 0) {
            for (var i = 0; i < parent.children.length; i++) {
                parent.children[i] = this.reInitializeChildren(parent.children[i]);
            }
        }
        if (this.componentIsRoot(parent.id)) {
            return parent;
        }
        var emptyComponent;
        if (parent.type == 0) {
            emptyComponent = new PowerSource(0, 0, 0);
        }
        else if (parent.type == 1) {
            emptyComponent = new Lamp(0, 0);
        }
        else if (parent.type == 2) {
            emptyComponent = new Resistor(0, 0);
        }
        else if (parent.type == 3) {
            emptyComponent = new Switch(0);
            //JSON CONVERTS INFINITY TO NULL SO FIXES THAT        
            parent.offResistance = emptyComponent.offResistance;
            if (parent.resistance == null) {
                parent.resistance = parent.offResistance;
            }
        }
        else {
            emptyComponent = new Component(0, 0);
        }
        //REMOVE FOCUS FROM ALL ELEMENTS
        parent.hasFocus = false;
        //ASSIGN NEW IDS
        this.lastComponentId++;
        parent.id = this.lastComponentId;
        //RE-INITIALIZES INSTANCES
        return forceAssignInstances(parent, emptyComponent);
    };
    Circuit.prototype.render = function () {
        //DRAWS WIRES COMPLETING CIRCUIT
        var width = (this.rootComponent.findLongestBranch(1) * 2 - 1) * this.componentSize;
        var height = this.rootComponent.findMaxChildren(1) * this.componentSize;
        this.ctx = drawLine(this.ctx, this.locX, this.locY, this.locX, this.locY + height, 'red');
        this.ctx = drawLine(this.ctx, this.locX, this.locY + height, this.locX + width, this.locY + height, 'red');
        this.ctx = drawLine(this.ctx, this.locX + width, this.locY, this.locX + width, this.locY + height, 'red');
        this.rootComponent.render(this.ctx, this.locX, this.locY, this.componentSize);
    };
    Circuit.prototype.componentIsRoot = function (componentId) {
        if (componentId == 0) {
            return true;
        }
        return false;
    };
    Circuit.prototype.getComponentByCoords = function (x, y) {
        return this.rootComponent.getComponentByCoords(this.locX, this.locY, this.componentSize, x, y);
    };
    Circuit.prototype.getComponentById = function (componentId, firstComponent) {
        if (firstComponent === void 0) { firstComponent = this.rootComponent; }
        if (firstComponent.id == componentId) {
            return firstComponent;
        }
        //RECURSIVELY FINDS MACTHING ID
        var matchingComponent;
        for (var i = 0; i < firstComponent.children.length; i++) {
            matchingComponent = this.getComponentById(componentId, firstComponent.children[i]);
            if (matchingComponent != null) {
                return matchingComponent;
            }
        }
        return null;
    };
    Circuit.prototype.getComponentParentById = function (componentId, firstComponent) {
        if (firstComponent === void 0) { firstComponent = this.rootComponent; }
        //RECURSIVELY FINDS MACTHING ID
        var matchingComponent;
        for (var i = 0; i < firstComponent.children.length; i++) {
            if (firstComponent.children[i].id == componentId) {
                return firstComponent;
            }
            else {
                matchingComponent = this.getComponentParentById(componentId, firstComponent.children[i]);
                if (matchingComponent != null) {
                    return matchingComponent;
                }
            }
        }
        return null;
    };
    Circuit.prototype.resetConsumption = function () {
        this.rootComponent.consumption = 0;
        this.forEachRootComponentInTree(function (component) {
            for (var i = void 0; i < component.children.length; i++) {
                component.children[i].consumption = 0;
            }
        });
    };
    Circuit.prototype.getLastComponentId = function () {
        //FINDS LAST COMPONENT
        var lastComponent = this.rootComponent;
        while (lastComponent.children.length != 0) {
            lastComponent = lastComponent.children[0];
        }
        return lastComponent.id;
    };
    Circuit.prototype.addComponent = function (parentId, component) {
        var parentComponent = this.getComponentById(parentId);
        if (parentComponent == null) {
            return;
        }
        this.lastComponentId++;
        component.id = this.lastComponentId;
        parentComponent.children.push(component);
    };
    Circuit.prototype.deleteComponent = function (componentId) {
        var parentComponent = this.getComponentParentById(componentId);
        for (var i = 0; i < parentComponent.children.length; i++) {
            if (parentComponent.children[i].id == componentId) {
                var componentChildren = parentComponent.children[i].children;
                //REMOVES COMPONENT
                parentComponent.children = parentComponent.children.slice(0, i).concat(parentComponent.children.slice(i + 1));
                //IF REMOVED COMPONENT HAD CHILDREN, ADDS THEM TO PARENT COMPONENT
                if (componentChildren.length > 0) {
                    if (parentComponent.children.length > 0) {
                        parentComponent.children[0].children = componentChildren;
                    }
                    else {
                        parentComponent.children = componentChildren;
                    }
                }
                return true;
            }
        }
        return false;
    };
    Circuit.prototype.forEachRootComponentInTree = function (callback) {
        var currentComponent = this.rootComponent;
        while (currentComponent.children.length != 0) {
            callback(currentComponent);
            currentComponent = currentComponent.children[0];
        }
    };
    Circuit.prototype.simulate = function (time) {
        var _this = this;
        if (time == 0) {
            this.current = 0;
        }
        //RESET CIRCUIT INFO
        this.hasFailed = false;
        //CALCULATE RESISTANCE
        this.resistance = this.rootComponent.resistance;
        var parallelResistances = [];
        var parallelResistance;
        this.forEachRootComponentInTree(function (currentComponent) {
            //CALCULATE PARALLEL RESISTANCE
            parallelResistance = 0;
            for (var i = 0; i < currentComponent.children.length; i++) {
                parallelResistance += 1 / currentComponent.children[i].resistance;
            }
            parallelResistance = (1 / parallelResistance);
            parallelResistances.push(parallelResistance);
            _this.resistance += (parallelResistance);
        });
        //CALCULATE
        this.current = this.rootComponent.voltage / this.resistance;
        //CALCULATE ALL COMPONENTS VOLTAGES, CURRENT, CONSUMPTION
        var parallelVoltages = [];
        for (var i = 0; i < parallelResistances.length; i++) {
            parallelVoltages.push(fixPossibleNan(parallelResistances[i] * this.current));
        }
        var componentDepth = 0;
        this.forEachRootComponentInTree(function (currentComponent) {
            for (var i = 0; i < currentComponent.children.length; i++) {
                currentComponent.children[i].voltage = parallelVoltages[componentDepth];
                currentComponent.children[i].current = fixPossibleNan(parallelVoltages[componentDepth] / currentComponent.children[i].resistance);
                currentComponent.children[i].hasFailed = false;
                if (currentComponent.children[i].current > currentComponent.children[i].maxCurrent) {
                    //IF COMPONENT CURRENT IS HIGHER THAN MAX CURRENT, CIRCUIT FAILED FLAG IS TRUE
                    currentComponent.children[i].hasFailed = true;
                    _this.hasFailed = true;
                }
                currentComponent.children[i].consumption += currentComponent.children[i].voltage * currentComponent.children[i].current * time;
            }
            componentDepth++;
        });
        //UPDATE ROOT COMPONENT AND CHECK FOR FAILURE
        this.rootComponent.hasFailed = false;
        this.rootComponent.current = this.current;
        if (this.rootComponent.current > this.rootComponent.maxCurrent) {
            this.rootComponent.hasFailed = true;
            this.hasFailed = true;
        }
        this.rootComponent.consumption += this.rootComponent.voltage * this.current * time;
    };
    return Circuit;
}());
var Component = /** @class */ (function () {
    function Component(maxCurrent, resistance) {
        this.type = -1;
        this.current = 0;
        this.voltage = 0;
        this.maxCurrent = maxCurrent;
        this.resistance = resistance;
        this.consumption = 0;
        this.type = 0;
        this.children = [];
        this.hasFocus = false;
        this.hasFailed = false;
    }
    Component.prototype.drawFocus = function (ctx, locX, locY, size) {
        if (this.hasFocus) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.setLineDash([4]);
            ctx.beginPath();
            ctx.rect(locX, locY - size / 2, size, size);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    };
    Component.prototype.render = function (ctx, locX, locY, size) {
        this.drawFocus(ctx, locX, locY, size);
        this.renderChildren(ctx, locX, locY, size);
        if (this.hasFailed) {
            ctx = drawLine(ctx, locX, locY - size / 2, locX + size, locY + size / 2, "orange");
            ctx = drawLine(ctx, locX, locY + size / 2, locX + size, locY - size / 2, "orange");
        }
    };
    Component.prototype.renderChildren = function (ctx, locX, locY, size) {
        if (this.children.length > 0) {
            //DRAWS WIRES
            ctx = drawLine(ctx, locX + size, locY, locX + size * 2, locY, 'red');
            ctx = drawLine(ctx, locX + size * 2, locY, locX + size * 2, locY + size * (this.children.length - 1), 'red');
            ctx = drawLine(ctx, locX + size * 3, locY, locX + size * 3, locY + size * (this.children.length - 1), 'red');
            //IF HAS CHILDRENS DRAWS THEM RECURSIVELY
            for (var i = 0; i < this.children.length; i++) {
                //CHILDS COORDINATES
                var childCoords = this.getChildCoords(locX, locY, size, i);
                this.children[i].render(ctx, childCoords[0], childCoords[1], size);
            }
        }
    };
    Component.prototype.findMaxChildren = function (currentMax) {
        if (currentMax < this.children.length) {
            currentMax = this.children.length;
        }
        for (var i = 0; i < this.children.length; i++) {
            var childrenMax = this.children[i].findMaxChildren(currentMax);
            if (childrenMax > currentMax) {
                currentMax = childrenMax;
            }
        }
        return currentMax;
    };
    Component.prototype.findLongestBranch = function (depth) {
        if (this.children.length == 0) {
            return depth;
        }
        for (var i = 0; i < this.children.length; i++) {
            var branchLenght = this.children[i].findLongestBranch(depth);
            if (branchLenght > depth) {
                depth = branchLenght;
            }
        }
        return depth + 1;
    };
    Component.prototype.getChildCoords = function (locX, locY, size, childNum) {
        return [locX + size * 2, locY + size * childNum];
    };
    Component.prototype.getComponentByCoords = function (componentX, componentY, componentSize, x, y) {
        if (componentX < x && componentX + componentSize > x && componentY - componentSize / 2 < y && componentY + componentSize / 2 > y) {
            return this;
        }
        for (var i = 0; i < this.children.length; i++) {
            //CHILDS COORDINATES
            var childCoords = this.getChildCoords(componentX, componentY, componentSize, i);
            var child = this.children[i].getComponentByCoords(childCoords[0], childCoords[1], componentSize, x, y);
            //IF FINDS MATCH STOPS RECURSION
            if (child != null) {
                return child;
            }
        }
        return null;
    };
    Component.prototype.getDisplayName = function () {
        if (this.type == -1)
            return "Komponentti " + this.id.toString();
        if (this.type == 0)
            return "Virtalähde " + this.id.toString();
        if (this.type == 1)
            return "Lamppu " + this.id.toString();
        if (this.type == 2)
            return "Vastus " + this.id.toString();
        if (this.type == 3)
            return "Kytkin " + this.id.toString();
    };
    return Component;
}());
var PowerSource = /** @class */ (function (_super) {
    __extends(PowerSource, _super);
    function PowerSource(maxCurrent, resistance, voltage) {
        var _this = _super.call(this, maxCurrent, resistance) || this;
        _this.type = 0;
        _this.voltage = voltage;
        return _this;
    }
    PowerSource.prototype.render = function (ctx, locX, locY, size) {
        //POWER SOURCE GRAPICHS
        ctx = drawLine(ctx, locX, locY, locX + size / 2 - 4, locY, 'black');
        ctx = drawLine(ctx, locX + size / 2 + 4, locY, locX + size, locY, 'black');
        ctx = drawLine(ctx, locX + size / 2 - 4, locY - size / 5, locX + size / 2 - 4, locY + size / 5, 'black');
        ctx = drawLine(ctx, locX + size / 2 + 4, locY - size / 2, locX + size / 2 + 4, locY + size / 2, 'black');
        _super.prototype.render.call(this, ctx, locX, locY, size);
    };
    return PowerSource;
}(Component));
var Lamp = /** @class */ (function (_super) {
    __extends(Lamp, _super);
    function Lamp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 1;
        return _this;
    }
    Lamp.prototype.render = function (ctx, locX, locY, size) {
        //LAMP BRIGHTNESS ACCORDING TO VOLTAGE
        var lampColor;
        if (this.hasFailed) {
            //IF CURRENT TOO HIGH, DISPLAY BROKEN LAMP
            lampColor = "gray";
        }
        else {
            var brightness = this.current / this.maxCurrent;
            lampColor = rgbToHex(255, 255 - brightness * 120, 255 * (1 - brightness));
        }
        ctx = drawCircle(ctx, locX + size / 2, locY, size / 2, lampColor, true);
        ctx = drawLine(ctx, locX, locY, locX + size / 4, locY, 'black');
        ctx = drawLine(ctx, locX + size - size / 4, locY, locX + size, locY, 'black');
        ctx = drawCircle(ctx, locX + size / 2, locY, size / 2);
        ctx = drawLine(ctx, locX + size / 3, locY - size / 6, locX + size - size / 3, locY + size / 6, 'black');
        ctx = drawLine(ctx, locX + size / 3, locY + size / 6, locX + size - size / 3, locY - size / 6, 'black');
        _super.prototype.render.call(this, ctx, locX, locY, size);
    };
    return Lamp;
}(Component));
var Resistor = /** @class */ (function (_super) {
    __extends(Resistor, _super);
    function Resistor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 2;
        return _this;
    }
    Resistor.prototype.render = function (ctx, locX, locY, size) {
        //RESISTOR GRAPICHS
        ctx = drawLine(ctx, locX, locY, locX + size, locY, 'black');
        ctx.fillStyle = 'black';
        ctx.fillRect(locX + size / 4, locY - size / 6, size / 2, size / 3);
        ctx.fillStyle = 'white';
        ctx.fillRect(locX + size / 4 + 4, locY - size / 6 + 4, size / 2 - 8, size / 3 - 8);
        _super.prototype.render.call(this, ctx, locX, locY, size);
    };
    return Resistor;
}(Component));
var Switch = /** @class */ (function (_super) {
    __extends(Switch, _super);
    function Switch(maxCurrent) {
        var _this = _super.call(this, maxCurrent, 0) || this;
        _this.type = 3;
        _this.offResistance = Infinity;
        _this.OnResistance = 0;
        _this.turnOn();
        return _this;
    }
    Switch.prototype.render = function (ctx, locX, locY, size) {
        if (this.isOn()) {
            //IF SWITCH IS ON
            ctx = drawLine(ctx, locX, locY, locX + size, locY, "black");
            ctx = drawLine(ctx, locX + size / 4, locY, locX + size - size / 4, locY, "green");
        }
        else {
            //IF SWITCH IS OFF
            ctx = drawLine(ctx, locX, locY, locX + size / 4, locY, "black");
            ctx = drawLine(ctx, locX + size - size / 4, locY, locX + size, locY, "black");
            ctx = drawLine(ctx, locX + size / 4, locY, locX + size - size / 4, locY - size / 4, "black");
        }
        _super.prototype.render.call(this, ctx, locX, locY, size);
    };
    Switch.prototype.turnOn = function () {
        this.resistance = this.OnResistance;
    };
    Switch.prototype.turnOff = function () {
        this.resistance = this.offResistance;
    };
    Switch.prototype.isOn = function () {
        if (this.resistance == this.OnResistance) {
            return true;
        }
        return false;
    };
    return Switch;
}(Component));
var currentSensor = /** @class */ (function (_super) {
    __extends(currentSensor, _super);
    function currentSensor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return currentSensor;
}(Component));
//HELPER FUNCTIONS
function getUserInputNumber(text, defaultValue) {
    var input = prompt(text, defaultValue.toString());
    if (!isNaN(parseFloat(input))) {
        return parseFloat(input);
    }
    return defaultValue;
}
function getUserInputString(text, defaultValue) {
    var input = prompt(text, defaultValue.toString());
    if (input.length > 0) {
        return input;
    }
    return defaultValue;
}
function getMouseX(e) {
    return e.clientX - mainWindow.offsetLeft;
}
function getMouseY(e) {
    return e.clientY - mainWindow.offsetTop;
}
//PAGE ELEMENTS
var componentDiv = getElement("componentDiv");
var circuitDiv = getElement("circuitDiv");
var componentInfoDiv = getElement("componentInfoDiv");
var selectedComponent;
//0 = SELECT TOOL, 1 = DELETE TOOL
var selectedTool = 0;
//CAMERA
var cameraDragStartX = null;
var cameraDragStartY = null;
var cameraOldX;
var cameraOldY;
//MOUSE
mainWindow.addEventListener('mousedown', function (e) {
    if (selectedTool == 0) {
        handleComponentSelectAction(e);
    }
    else if (selectedTool == 1) {
        handleComponentDeleteAction(e);
    }
    //MOVE CAMERA IF LEFT BUTTON PRESSED
    if (e.which == 1) {
        cameraOldX = cameraX;
        cameraOldY = cameraY;
        cameraDragStartX = getMouseX(e);
        cameraDragStartY = getMouseY(e);
    }
});
document.addEventListener('mouseup', function (e) {
    cameraDragStartX = null;
    cameraDragStartY = null;
});
document.addEventListener('mousemove', function (e) {
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
    //HIDES MENUS WHEN MOUSE GOES OUTSIDE WINDOW
    if (mouseX < 0 || mouseX > mainWindow.width || mouseY < 0 || mouseY > mainWindow.height) {
        componentDiv.style.display = "none";
        circuitDiv.style.display = "none";
    }
    //IF DRAGGING CAMERA, UPDATE CAMERA POSITION
    if (cameraDragStartX != null && cameraDragStartY != null) {
        cameraX = cameraOldX + Math.round((mouseX - cameraDragStartX));
        cameraY = cameraOldY + Math.round((mouseY - cameraDragStartY));
    }
    render();
    //DRAWS CURSOR ACCORDING TO SELECTED TOOL
    if (selectedTool == 0) {
        mainCtx = drawCircle(mainCtx, mouseX, mouseY, 2, "black", true);
    }
    else if (selectedTool == 1) {
        mainCtx = drawLine(mainCtx, mouseX + 10, mouseY + 10, mouseX - 10, mouseY - 10, "black", 2);
        mainCtx = drawLine(mainCtx, mouseX - 10, mouseY + 10, mouseX + 10, mouseY - 10, "black", 2);
    }
});
//COMPONENT DELETE ACTION
function handleComponentDeleteAction(e) {
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
    selectedComponent = circuit.getComponentByCoords(mouseX, mouseY);
    if (selectedComponent != null && circuit.componentIsRoot(selectedComponent.id) == false) {
        //DELETE SELECTED COMPONENT IF NOT ROOT
        stopSimulation();
        circuit.deleteComponent(selectedComponent.id);
    }
}
//COMPONENT SELECT ACTION
function handleComponentSelectAction(e) {
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
    //IF NO CIRCUIT FOUND, SHOWS ONLY NEW CIRCUIT BTN
    getElement("addCircuitElementBtnDiv").style.display = "inline";
    if (circuit == null) {
        getElement("addCircuitElementBtnDiv").style.display = "none";
        circuitDiv.style.left = (e.clientX + 5).toString() + 'px';
        circuitDiv.style.top = (e.clientY + 5).toString() + 'px';
        circuitDiv.style.display = "inline";
        return;
    }
    //REMOVE FOCUS AND CLOSES DIVS
    if (selectedComponent != null)
        selectedComponent.hasFocus = false;
    componentInfoDiv.style.display = "none";
    if (componentDiv.style.display == "inline" || circuitDiv.style.display == "inline") {
        componentDiv.style.display = "none";
        circuitDiv.style.display = "none";
        render();
        return;
    }
    //ADDS FOCUS IF COORDINATES MATCH WITH COMPONENT
    selectedComponent = circuit.getComponentByCoords(mouseX, mouseY);
    if (selectedComponent != null) {
        selectedComponent.hasFocus = true;
        //SHOWS COMPONENT INFO DIV
        componentInfoDiv.style.display = "inline";
        updateComponentInfoDiv(selectedComponent);
        if (selectedComponent instanceof Switch && e.which == 1) {
            //IF LEFT CLICKED SWITCH, SWITCHES IT
            if (selectedComponent.isOn()) {
                selectedComponent.turnOff();
            }
            else {
                selectedComponent.turnOn();
            }
        }
        else if (circuit.componentIsRoot(selectedComponent.id) == false && e.which == 3) {
            //OPENS COMPONENT DIV IF RIGHT CLICKED AND NOT ROOT
            //HIDES COMPONENT DIV ADD BUTTONS IF COMPONENT IS POWER SOURCE: PARALLEL POWER SOURCE IS FORBIDDEN
            getElement("addElementParallelBtnDiv").style.display = "inline";
            if (selectedComponent instanceof PowerSource) {
                getElement("addElementParallelBtnDiv").style.display = "none";
            }
            componentDiv.style.left = (e.clientX + 5).toString() + 'px';
            componentDiv.style.top = (e.clientY + 5).toString() + 'px';
            componentDiv.style.display = "inline";
        }
    }
    else if (e.which == 3) {
        //OPENS CIRCUIT DIV
        circuitDiv.style.left = (e.clientX + 5).toString() + 'px';
        circuitDiv.style.top = (e.clientY + 5).toString() + 'px';
        circuitDiv.style.display = "inline";
    }
    render();
}
//GUI ACTIONS
function toolRadioBtnOnClick(action) {
    selectedTool = action;
}
function componentDivAction(action) {
    stopSimulation();
    var selectedComponentParentId = circuit.getComponentParentById(selectedComponent.id).id;
    if (action == 1) {
        circuit.addComponent(selectedComponentParentId, new Lamp(1, 1));
    }
    else if (action == 2) {
        circuit.addComponent(selectedComponentParentId, new Resistor(4, 2));
    }
    else if (action == 3) {
        circuit.addComponent(selectedComponentParentId, new Switch(20));
    }
    else {
        circuit.deleteComponent(selectedComponent.id);
    }
    selectedComponent.hasFocus = false;
    componentDiv.style.display = "none";
    render();
}
function circuitDivAction(action) {
    stopSimulation();
    if (action == 1) {
        circuit.addComponent(circuit.getLastComponentId(), new PowerSource(2, 0, 1));
    }
    else if (action == 2) {
        circuit.addComponent(circuit.getLastComponentId(), new Lamp(1, 1));
    }
    else if (action == 3) {
        circuit.addComponent(circuit.getLastComponentId(), new Resistor(4, 2));
    }
    else if (action == 4) {
        circuit.addComponent(circuit.getLastComponentId(), new Switch(20));
    }
    else if (action == 5) {
        //circuit = new Circuit(mainCtx, 100, 100, 50)
    }
    circuitDiv.style.display = "none";
    render();
}
function componentEditAction(action) {
    stopSimulation();
    if (selectedComponent == null) {
        return;
    }
    if (action == 1 && selectedComponent instanceof PowerSource) {
        selectedComponent.voltage = getUserInputNumber("Uusi jännite:", selectedComponent.voltage);
    }
    else if (action == 2) {
        selectedComponent.resistance = getUserInputNumber("Uusi resistanssi:", selectedComponent.resistance);
    }
    else if (action == 3) {
        selectedComponent.maxCurrent = getUserInputNumber("Uusi maksimi virta:", selectedComponent.maxCurrent);
    }
    updateComponentInfoDiv(selectedComponent);
}
function updateComponentInfoDiv(component) {
    if (component != null && componentInfoDiv.style.display != "none") {
        //IF COMPONENT IS BROKEN ADDS WARNING TEXT
        getElement("componentWarningText").innerHTML = "";
        if (component.hasFailed)
            getElement("componentWarningText").innerHTML = "Rikki, suurin sallittu virta ylittyi!";
        getElement("componentTypeText").innerHTML = component.getDisplayName();
        getElement("componentVoltageText").innerHTML = getDecimal(component.voltage) + " V";
        getElement("componentResistanceText").innerHTML = getDecimal(component.resistance) + " Ω";
        getElement("componentCurrentText").innerHTML = getDecimal(component.current) + " / " + getDecimal(component.maxCurrent) + " A";
        getElement("componentConsumptionText").innerHTML = getDecimal(component.consumption) + " As";
        //SHOW VOLTAGE EDIT BUTTON IF COMPONENT IS POWER SOURCE
        getElement("componentVoltageEditBtn").style.display = "none";
        if (selectedComponent instanceof PowerSource) {
            getElement("componentVoltageEditBtn").style.display = "inline";
        }
        //HIDE RESISSTANCE EDIT BUTTON IF COMPONENT IS SWITCH
        getElement("resistanceEditBtn").style.display = "inline";
        if (selectedComponent instanceof Switch) {
            getElement("resistanceEditBtn").style.display = "none";
        }
    }
}
function saveCircuit() {
    stopSimulation();
    var data = JSON.stringify(circuit);
    var fileName = getUserInputString("Tiedoston nimi:", "virtapiiri") + ".txt";
    download(data, fileName, "text/plain");
}
getElement("circuitInput").addEventListener('change', handleCircuitFileSelect, false);
function handleCircuitFileSelect(event) {
    var reader = new FileReader();
    reader.onload = loadCircuit;
    reader.readAsText(event.target.files[0]);
}
function loadCircuit(event) {
    stopSimulation();
    try {
        var circuitData = JSON.parse(event.target.result);
        //INIT NEW CIRCUIT
        circuit = new Circuit(mainCtx, circuitData.locX, circuitData.locY, circuitData.componentSize);
        circuit.reInitialize(circuitData);
    }
    catch (error) {
        console.log(error);
    }
}
//SIMULATION CONTROL
var simulationTimerID = null;
function startStopSimulation() {
    if (simulationTimerID != null) {
        stopSimulation();
    }
    else {
        simulationTime = 0;
        circuit.resetConsumption();
        simulationTimerID = setInterval(simulationTick, 100);
        document.getElementById("simStartStop").value = "Pysäytä";
    }
}
function stopSimulation() {
    clearInterval(simulationTimerID);
    simulationTimerID = null;
    render();
    document.getElementById("simStartStop").value = "Aloita";
}
//# sourceMappingURL=build.js.map