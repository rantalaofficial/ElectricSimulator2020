function saveCircuit() {
    stopSimulation();
    var data = JSON.stringify(circuit);
    var fileName = getUserInputString("Tiedoston nimi:", "virtapiiri") + ".txt";
    download(data, fileName, "text/plain");
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
getElement("circuitInput").addEventListener('change', handleCircuitFileSelect, false);
function handleCircuitFileSelect(event) {
    var reader = new FileReader();
    reader.onload = loadCircuit;
    reader.readAsText(event.target.files[0]);
}
//# sourceMappingURL=saving.js.map