//LIBRARIES
declare let download: any;

function saveCircuit() {
    stopSimulation()
    let data: string = JSON.stringify(circuit)

    let fileName = getUserInputString("Tiedoston nimi:", "virtapiiri") + ".txt"
    download(data, fileName, "text/plain")
}

function loadCircuit(event) {
    stopSimulation()
    try {
        let circuitData: Circuit = JSON.parse(event.target.result)
        //INIT NEW CIRCUIT
        circuit = new Circuit(mainCtx, circuitData.locX, circuitData.locY, circuitData.componentSize)
        circuit.reInitialize(circuitData)
    } catch (error) {
        console.log(error)
    }
}

getElement("circuitInput").addEventListener('change', handleCircuitFileSelect, false);
function handleCircuitFileSelect(event) {
    const reader = new FileReader()
    reader.onload = loadCircuit;
    reader.readAsText(event.target.files[0])
}