//HELPER FUNCTIONS
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
function getMouseX(e) {
    return e.clientX - mainWindow.offsetLeft;
}
function getMouseY(e) {
    return e.clientY - mainWindow.offsetTop;
}
//PAGE ELEMENTS
var componentDiv = getElement("componentDiv");
var circuitDiv = getElement("circuitDiv");
var componentInfoDiv = getElement("componentInfoDiv");
var selectedComponent;
//0 = SELECT TOOL, 1 = DELETE TOOL
var selectedTool = 0;
//CAMERA
var cameraDragStartX = null;
var cameraDragStartY = null;
var cameraOldX;
var cameraOldY;
//MOUSE
mainWindow.addEventListener('mousedown', function (e) {
    if (selectedTool == 0) {
        handleComponentSelectAction(e);
    }
    else if (selectedTool == 1) {
        handleComponentDeleteAction(e);
    }
    //MOVE CAMERA IF LEFT BUTTON PRESSED
    if (e.which == 1) {
        cameraOldX = cameraX;
        cameraOldY = cameraY;
        cameraDragStartX = getMouseX(e);
        cameraDragStartY = getMouseY(e);
    }
});
document.addEventListener('mouseup', function (e) {
    cameraDragStartX = null;
    cameraDragStartY = null;
});
document.addEventListener('mousemove', function (e) {
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
    //HIDES MENUS WHEN MOUSE GOES OUTSIDE WINDOW
    if (mouseX < 0 || mouseX > mainWindow.width || mouseY < 0 || mouseY > mainWindow.height) {
        componentDiv.style.display = "none";
        circuitDiv.style.display = "none";
    }
    //IF DRAGGING CAMERA, UPDATE CAMERA POSITION
    if (cameraDragStartX != null && cameraDragStartY != null) {
        cameraX = cameraOldX + Math.round((mouseX - cameraDragStartX));
        cameraY = cameraOldY + Math.round((mouseY - cameraDragStartY));
    }
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
//COMPONENT DELETE ACTION
function handleComponentDeleteAction(e) {
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
    selectedComponent = circuit.getComponentByCoords(mouseX, mouseY);
    if (selectedComponent != null && circuit.componentIsRoot(selectedComponent.id) == false) {
        //DELETE SELECTED COMPONENT IF NOT ROOT
        stopSimulation();
        circuit.deleteComponent(selectedComponent.id);
    }
}
//COMPONENT SELECT ACTION
function handleComponentSelectAction(e) {
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
    //IF NO CIRCUIT FOUND, SHOWS ONLY NEW CIRCUIT BTN
    getElement("addCircuitElementBtnDiv").style.display = "inline";
    if (circuit == null) {
        getElement("addCircuitElementBtnDiv").style.display = "none";
        circuitDiv.style.left = (e.clientX + 5).toString() + 'px';
        circuitDiv.style.top = (e.clientY + 5).toString() + 'px';
        circuitDiv.style.display = "inline";
        return;
    }
    //REMOVE FOCUS AND CLOSES DIVS
    if (selectedComponent != null)
        selectedComponent.hasFocus = false;
    componentInfoDiv.style.display = "none";
    if (componentDiv.style.display == "inline" || circuitDiv.style.display == "inline") {
        componentDiv.style.display = "none";
        circuitDiv.style.display = "none";
        render();
        return;
    }
    //ADDS FOCUS IF COORDINATES MATCH WITH COMPONENT
    selectedComponent = circuit.getComponentByCoords(mouseX, mouseY);
    if (selectedComponent != null) {
        selectedComponent.hasFocus = true;
        //SHOWS COMPONENT INFO DIV
        componentInfoDiv.style.display = "inline";
        updateComponentInfoDiv(selectedComponent);
        if (selectedComponent instanceof Switch && e.which == 1) {
            //IF LEFT CLICKED SWITCH, SWITCHES IT
            if (selectedComponent.isOn()) {
                selectedComponent.turnOff();
            }
            else {
                selectedComponent.turnOn();
            }
        }
        else if (circuit.componentIsRoot(selectedComponent.id) == false && e.which == 3) {
            //OPENS COMPONENT DIV IF RIGHT CLICKED AND NOT ROOT
            //HIDES COMPONENT DIV ADD BUTTONS IF COMPONENT IS POWER SOURCE: PARALLEL POWER SOURCE IS FORBIDDEN
            getElement("addElementParallelBtnDiv").style.display = "inline";
            if (selectedComponent instanceof PowerSource) {
                getElement("addElementParallelBtnDiv").style.display = "none";
            }
            componentDiv.style.left = (e.clientX + 5).toString() + 'px';
            componentDiv.style.top = (e.clientY + 5).toString() + 'px';
            componentDiv.style.display = "inline";
        }
    }
    else if (e.which == 3) {
        //OPENS CIRCUIT DIV
        circuitDiv.style.left = (e.clientX + 5).toString() + 'px';
        circuitDiv.style.top = (e.clientY + 5).toString() + 'px';
        circuitDiv.style.display = "inline";
    }
    render();
}
//GUI ACTIONS
function toolRadioBtnOnClick(action) {
    selectedTool = action;
}
function componentDivAction(action) {
    stopSimulation();
    var selectedComponentParentId = circuit.getComponentParentById(selectedComponent.id).id;
    if (action == 1) {
        circuit.addComponent(selectedComponentParentId, new Lamp(1, 1));
    }
    else if (action == 2) {
        circuit.addComponent(selectedComponentParentId, new Resistor(4, 2));
    }
    else if (action == 3) {
        circuit.addComponent(selectedComponentParentId, new Switch(20));
    }
    else {
        circuit.deleteComponent(selectedComponent.id);
    }
    selectedComponent.hasFocus = false;
    componentDiv.style.display = "none";
    render();
}
function circuitDivAction(action) {
    stopSimulation();
    if (action == 1) {
        circuit.addComponent(circuit.getLastComponentId(), new PowerSource(2, 0, 1));
    }
    else if (action == 2) {
        circuit.addComponent(circuit.getLastComponentId(), new Lamp(1, 1));
    }
    else if (action == 3) {
        circuit.addComponent(circuit.getLastComponentId(), new Resistor(4, 2));
    }
    else if (action == 4) {
        circuit.addComponent(circuit.getLastComponentId(), new Switch(20));
    }
    else if (action == 5) {
        //circuit = new Circuit(mainCtx, 100, 100, 50)
    }
    circuitDiv.style.display = "none";
    render();
}
function componentEditAction(action) {
    stopSimulation();
    if (selectedComponent == null) {
        return;
    }
    if (action == 1 && selectedComponent instanceof PowerSource) {
        selectedComponent.voltage = getUserInputNumber("Uusi jännite:", selectedComponent.voltage);
    }
    else if (action == 2) {
        selectedComponent.resistance = getUserInputNumber("Uusi resistanssi:", selectedComponent.resistance);
    }
    else if (action == 3) {
        selectedComponent.maxCurrent = getUserInputNumber("Uusi maksimi virta:", selectedComponent.maxCurrent);
    }
    updateComponentInfoDiv(selectedComponent);
}
function updateComponentInfoDiv(component) {
    if (component != null && componentInfoDiv.style.display != "none") {
        //IF COMPONENT IS BROKEN ADDS WARNING TEXT
        getElement("componentWarningText").innerHTML = "";
        if (component.hasFailed)
            getElement("componentWarningText").innerHTML = "Rikki, suurin sallittu virta ylittyi!";
        getElement("componentTypeText").innerHTML = component.getDisplayName();
        getElement("componentVoltageText").innerHTML = getDecimal(component.voltage) + " V";
        getElement("componentResistanceText").innerHTML = getDecimal(component.resistance) + " Ω";
        getElement("componentCurrentText").innerHTML = getDecimal(component.current) + " / " + getDecimal(component.maxCurrent) + " A";
        getElement("componentConsumptionText").innerHTML = getDecimal(component.consumption) + " As";
        //SHOW VOLTAGE EDIT BUTTON IF COMPONENT IS POWER SOURCE
        getElement("componentVoltageEditBtn").style.display = "none";
        if (selectedComponent instanceof PowerSource) {
            getElement("componentVoltageEditBtn").style.display = "inline";
        }
        //HIDE RESISSTANCE EDIT BUTTON IF COMPONENT IS SWITCH
        getElement("resistanceEditBtn").style.display = "inline";
        if (selectedComponent instanceof Switch) {
            getElement("resistanceEditBtn").style.display = "none";
        }
    }
}
function saveCircuit() {
    stopSimulation();
    var data = JSON.stringify(circuit);
    var fileName = getUserInputString("Tiedoston nimi:", "virtapiiri") + ".txt";
    download(data, fileName, "text/plain");
}
getElement("circuitInput").addEventListener('change', handleCircuitFileSelect, false);
function handleCircuitFileSelect(event) {
    var reader = new FileReader();
    reader.onload = loadCircuit;
    reader.readAsText(event.target.files[0]);
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
//SIMULATION CONTROL
var simulationTimerID = null;
function startStopSimulation() {
    if (simulationTimerID != null) {
        stopSimulation();
    }
    else {
        simulationTime = 0;
        circuit.resetConsumption();
        simulationTimerID = setInterval(simulationTick, 100);
        document.getElementById("simStartStop").value = "Pysäytä";
    }
}
function stopSimulation() {
    clearInterval(simulationTimerID);
    simulationTimerID = null;
    render();
    document.getElementById("simStartStop").value = "Aloita";
}
//# sourceMappingURL=controls.js.map