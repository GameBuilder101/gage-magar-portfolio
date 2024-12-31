document.addEventListener("pointerdown", pointerDownHandler, false);
document.addEventListener("pointerup", pointerUpHandler, false);
document.addEventListener("keypress", keyPressHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let isPointerDown = false;
let isKeyDownA = false;
let isKeyDownD = false;
let isKeyDownW = false;
let isKeyDownQ = false;
let isKeyDownE = false;

// When the pointer is held down
function pointerDownHandler(event) {
    isPointerDown = true;
}

// When the pointer is released
function pointerUpHandler(event) {
    isPointerDown = false;
}

// When a keyboard key is pressed
function keyPressHandler(event) {
    switch (event.code) {
        case "KeyA":
            isKeyDownA = true;
            break;
        case "KeyD":
            isKeyDownD = true;
            break;
        case "KeyW":
            isKeyDownW = true;
            break;
        case "KeyQ":
            isKeyDownQ = true;
            break;
        case "KeyE":
            isKeyDownE = true;
            break;
    }
}

// When a keyboard key is released
function keyUpHandler(event) {
    switch (event.code) {
        case "KeyA":
            isKeyDownA = false;
            break;
        case "KeyD":
            isKeyDownD = false;
            break;
        case "KeyW":
            isKeyDownW = false;
            break;
        case "KeyQ":
            isKeyDownQ = false;
            break;
        case "KeyE":
            isKeyDownE = false;
            break;
    }
}
