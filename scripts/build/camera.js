var cameraX = 0;
var cameraY = 0;
var cameraDragStartX = null;
var cameraDragStartY = null;
var cameraOldX;
var cameraOldY;
mainWindow.addEventListener('mousedown', function (e) {
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
    //IF DRAGGING CAMERA, UPDATE CAMERA POSITION
    if (cameraDragStartX != null && cameraDragStartY != null) {
        cameraX = cameraOldX + Math.round((mouseX - cameraDragStartX));
        cameraY = cameraOldY + Math.round((mouseY - cameraDragStartY));
    }
});
//# sourceMappingURL=camera.js.map