function getMouseX(e) {
    return e.clientX - mainWindow.offsetLeft;
}
function getMouseY(e) {
    return e.clientY - mainWindow.offsetTop;
}

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

function render() {
    //DRAW BACKGROUND GRID PATTERN
    let gridSize = 30;
    let grdiStartX: number = cameraX % gridSize - gridSize;
    let grdiStartY: number = cameraY % gridSize - gridSize;

    for(let y: number = grdiStartY; y <= mainWindow.height + gridSize; y += gridSize) {
        for(let x: number = grdiStartX; x <= mainWindow.width + gridSize; x += gridSize) {
            mainCtx.fillStyle = "lightgray";
            mainCtx.fillRect(x, y, gridSize, gridSize);
            mainCtx.fillStyle = "white";
            mainCtx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
        }
    }

    //CAMERA LOCATION TEXT
    mainCtx.fillStyle = "black"
    mainCtx.font = "12px Arial";
    mainCtx.fillText("(" + cameraX.toString() + ", " + cameraY.toString() + ")", 5, 20);

    circuit.locX = 100 + cameraX;
    circuit.locY = 100 + cameraY;
    circuit.render()
}

document.addEventListener('mousemove', (e) => {
    let mouseX: number = getMouseX(e);
    let mouseY: number = getMouseY(e);
    render()
    //DRAWS CURSOR ACCORDING TO SELECTED TOOL
    if(selectedTool == 0) {
        mainCtx = drawCircle(mainCtx, mouseX, mouseY, 2, "black", true);
    } else if(selectedTool == 1) {
        mainCtx = drawLine(mainCtx, mouseX + 10, mouseY + 10, mouseX - 10, mouseY - 10, "black", 2);
        mainCtx = drawLine(mainCtx, mouseX - 10, mouseY + 10, mouseX + 10, mouseY - 10, "black", 2);
    }
})
