//PAGE ELEMENTS
var componentDiv = getElement("componentDiv");
var circuitDiv = getElement("circuitDiv");
var componentInfoDiv = getElement("componentInfoDiv");
var selectedComponent;
//0 = SELECT TOOL, 1 = DELETE TOOL
var selectedTool = 0;
//MOUSE
mainWindow.addEventListener('mousedown', function (e) {
    if (selectedTool == 0) {
        handleComponentSelectAction(e);
    }
    else if (selectedTool == 1) {
        handleComponentDeleteAction(e);
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
//# sourceMappingURL=controls.js.map