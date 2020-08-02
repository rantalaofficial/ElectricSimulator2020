//PAGE ELEMENTS
let componentDiv = <HTMLElement> getElement("componentDiv");
let circuitDiv = <HTMLElement> getElement("circuitDiv");
let componentInfoDiv = <HTMLElement> getElement("componentInfoDiv");

let selectedComponent: Component;
//0 = SELECT TOOL, 1 = DELETE TOOL
let selectedTool: number = 0

//MOUSE
mainWindow.addEventListener('mousedown', (e) => {
    if(selectedTool == 0) {
        handleComponentSelectAction(e);
    } else if(selectedTool == 1) {
        handleComponentDeleteAction(e);
    }
});

//COMPONENT DELETE ACTION
function handleComponentDeleteAction(e) {
    let mouseX: number = getMouseX(e);
    let mouseY: number = getMouseY(e);

    selectedComponent = circuit.getComponentByCoords(mouseX, mouseY);
    if(selectedComponent != null && circuit.componentIsRoot(selectedComponent.id) == false) {
        //DELETE SELECTED COMPONENT IF NOT ROOT
        stopSimulation();
        circuit.deleteComponent(selectedComponent.id);
    }
}

//COMPONENT SELECT ACTION
function handleComponentSelectAction(e) {
    let mouseX: number = getMouseX(e);
    let mouseY: number = getMouseY(e);

    //IF NO CIRCUIT FOUND, SHOWS ONLY NEW CIRCUIT BTN
    getElement("addCircuitElementBtnDiv").style.display = "inline"
    if(circuit == null) {
        getElement("addCircuitElementBtnDiv").style.display = "none"
        circuitDiv.style.left = (e.clientX + 5).toString() + 'px';
        circuitDiv.style.top = (e.clientY + 5).toString() + 'px';
        circuitDiv.style.display = "inline";
        return;
    }

    //REMOVE FOCUS AND CLOSES DIVS
    if(selectedComponent != null) selectedComponent.hasFocus = false;
    componentInfoDiv.style.display = "none"
    if(componentDiv.style.display == "inline" || circuitDiv.style.display == "inline") {
        componentDiv.style.display = "none";
        circuitDiv.style.display = "none";
        render();
        return;
    }

    //ADDS FOCUS IF COORDINATES MATCH WITH COMPONENT
    selectedComponent = circuit.getComponentByCoords(mouseX, mouseY);
    if(selectedComponent != null) {
        selectedComponent.hasFocus = true;
        
        //SHOWS COMPONENT INFO DIV
        componentInfoDiv.style.display = "inline";
        updateComponentInfoDiv(selectedComponent);

        if(selectedComponent instanceof Switch && e.which == 1) {
            //IF LEFT CLICKED SWITCH, SWITCHES IT
            if(selectedComponent.isOn()) {
                selectedComponent.turnOff();  
            } else {
                selectedComponent.turnOn();
            }
        } else if(circuit.componentIsRoot(selectedComponent.id) == false && e.which == 3) {
            //OPENS COMPONENT DIV IF RIGHT CLICKED AND NOT ROOT
            //HIDES COMPONENT DIV ADD BUTTONS IF COMPONENT IS POWER SOURCE: PARALLEL POWER SOURCE IS FORBIDDEN
            getElement("addElementParallelBtnDiv").style.display = "inline"
            if(selectedComponent instanceof PowerSource) {
                getElement("addElementParallelBtnDiv").style.display = "none"
            }

            componentDiv.style.left = (e.clientX + 5).toString() + 'px';
            componentDiv.style.top = (e.clientY + 5).toString() + 'px';
            componentDiv.style.display = "inline";
        }
    } else if(e.which == 3) {
        //OPENS CIRCUIT DIV
        circuitDiv.style.left = (e.clientX + 5).toString() + 'px';
        circuitDiv.style.top = (e.clientY + 5).toString() + 'px';
        circuitDiv.style.display = "inline";
    }
    render();
}




