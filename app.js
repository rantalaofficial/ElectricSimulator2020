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
//# sourceMappingURL=app.js.map