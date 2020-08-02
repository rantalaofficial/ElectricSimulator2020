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
//# sourceMappingURL=component.js.map