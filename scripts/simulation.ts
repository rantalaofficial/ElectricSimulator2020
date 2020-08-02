let simulationTime: number = 0;
let simulationTimerID: number = null;

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

function startStopSimulation() {
    if(simulationTimerID != null) {
        stopSimulation()
    } else {
        simulationTime = 0;
        circuit.resetConsumption();
        simulationTimerID = setInterval(simulationTick, 100);

        (<HTMLInputElement>document.getElementById("simStartStop")).value = "Pysäytä"
    }   
}

function stopSimulation() {
    clearInterval(simulationTimerID)
    simulationTimerID = null;
    render();

    (<HTMLInputElement>document.getElementById("simStartStop")).value  = "Aloita"
}

