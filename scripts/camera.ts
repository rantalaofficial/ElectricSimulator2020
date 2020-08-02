let cameraX: number = 0;
let cameraY: number = 0;
let cameraDragStartX: number = null;
let cameraDragStartY: number = null;
let cameraOldX: number;
let cameraOldY: number;

mainWindow.addEventListener('mousedown', (e) => {    
    if(e.which == 1) {
        cameraOldX = cameraX;
        cameraOldY = cameraY;
        cameraDragStartX = getMouseX(e);
        cameraDragStartY = getMouseY(e);
    }
});

document.addEventListener('mouseup', (e) => {
    cameraDragStartX = null;
    cameraDragStartY = null;
})

document.addEventListener('mousemove', (e) => {
    let mouseX: number = getMouseX(e);
    let mouseY: number = getMouseY(e);

    //IF DRAGGING CAMERA, UPDATE CAMERA POSITION
    if(cameraDragStartX != null && cameraDragStartY != null) {
        cameraX = cameraOldX + Math.round((mouseX - cameraDragStartX));
        cameraY = cameraOldY + Math.round((mouseY - cameraDragStartY));
    }
})

