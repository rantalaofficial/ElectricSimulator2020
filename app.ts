//HELPER FUNCTIONS
function getElement(id: string) {
    return document.getElementById(id);
}
function getDecimal(decimal: number) {
    return (Math.round(decimal * 100) / 100).toString();
}

//LIBRARIES
declare let download: any;

//WINDOW
const mainWindow = <HTMLCanvasElement> getElement("mainWindow");
let mainCtx = mainWindow.getContext("2d");

let simulationTime: number = 0;

//CAMERA
let cameraX: number = 0;
let cameraY: number = 0;

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

function simulationTick() {
    circuit.simulate(0.1);
    render()

    //IF CIRCUIT FAILED, STOPS SIMULATION
    if(circuit.hasFailed) {
        stopSimulation();
    }
    
    //UPDATE GUI
    updateComponentInfoDiv(selectedComponent);
    getElement("simTimeText").innerHTML = getDecimal(simulationTime) + " s";
    getElement("circuitResistanceText").innerHTML = getDecimal(circuit.resistance) + " Ω"
    getElement("circuitCurrentText").innerHTML = getDecimal(circuit.current) + " A"
    
    simulationTime += 0.1;
}

let circuit: Circuit = new Circuit(mainCtx, 100, 100, 50);








