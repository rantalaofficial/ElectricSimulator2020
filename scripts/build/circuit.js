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
            parallelVoltages.push(fixNaN(parallelResistances[i] * this.current));
        }
        var componentDepth = 0;
        this.forEachRootComponentInTree(function (currentComponent) {
            for (var i = 0; i < currentComponent.children.length; i++) {
                currentComponent.children[i].voltage = parallelVoltages[componentDepth];
                currentComponent.children[i].current = fixNaN(parallelVoltages[componentDepth] / currentComponent.children[i].resistance);
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
//# sourceMappingURL=circuit.js.map