function getMouseX(e) {
    return e.clientX - mainWindow.offsetLeft;
}
function getMouseY(e) {
    return e.clientY - mainWindow.offsetTop;
}
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
document.addEventListener('mousemove', function (e) {
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
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
//# sourceMappingURL=canvas.js.map