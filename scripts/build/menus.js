document.addEventListener('mousemove', function (e) {
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
    //HIDES MENUS WHEN MOUSE GOES OUTSIDE WINDOW
    if (mouseX < 0 || mouseX > mainWindow.width || mouseY < 0 || mouseY > mainWindow.height) {
        componentDiv.style.display = "none";
        circuitDiv.style.display = "none";
    }
});
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
//# sourceMappingURL=menus.js.map