function getElement(id: string) {
    return document.getElementById(id);
}
function getDecimal(decimal: number) {
    return (Math.round(decimal * 100) / 100).toString();
}

function getUserInputNumber(text: string, defaultValue: number) {
    let input: string = prompt(text, defaultValue.toString());
    if(!isNaN(parseFloat(input))) {
        return parseFloat(input);
    } 
    return defaultValue;
}

function getUserInputString(text: string, defaultValue: string) {
    let input: string = prompt(text, defaultValue.toString());
    if(input.length > 0) {
        return input;
    }
    return defaultValue;
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

function fixNaN(n: number) {
    if(isNaN(n)) {
        return 0;
    }
    return n;
}