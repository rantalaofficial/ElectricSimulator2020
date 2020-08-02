function getElement(id) {
    return document.getElementById(id);
}
function getDecimal(decimal) {
    return (Math.round(decimal * 100) / 100).toString();
}
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
function fixNaN(n) {
    if (isNaN(n)) {
        return 0;
    }
    return n;
}
//# sourceMappingURL=common.js.map