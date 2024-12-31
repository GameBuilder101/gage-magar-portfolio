let appContainer;

let crtFilter;

// Called when all scripts have finished loading
window.onload = (e) => {
    // Create the application
    appContainer = document.querySelector(".app-container");
    window.app = new PIXI.Application();

    crtFilter = new PIXI.filters.CRTFilter({
        time: 0,
        curvature: 0,
        vignettingAlpha: 0.25
    });

    postInit();
}

// Initializes the application window
async function postInit() {
    try {
        // Initialize the application
        await window.app.init({ width: 384, height: 256, roundPixels: true, antialias: false });
        // Preload all assets for the sake of performance
        await loadAssets();

        setState("play-button");
        window.app.ticker.add(tick);

        // Clear the load indicator
        appContainer.innerHTML = "";
        // Display the application
        appContainer.appendChild(window.app.canvas);

        // Establish post processing
        app.stage.filters = [crtFilter];
    }
    catch (e) {
        notifyError(e);
    }
}

// Notify the user if something went wrong
function notifyError(e) {
    appContainer.innerHTML = `<p id="load-state">Something went wrong. Please try reloading.<br>Error: ${e.message}</p>`;
    console.log(e);
}

// Changes the current game state
function setState(state) {
    window.state = state;
    window.app.stage.removeChildren();
    window.app.stage.x = 0;
    window.app.stage.y = 0;

    switch (state) {
        case "play-button":
            initPlayButton();
            break;
        case "title":
            initTitle();
            break;
        case "gameplay":
            initGameplay();
            break;
        case "gameover":
            initGameover();
            break;
    }
}

window.setState = setState;

window.bgScroll = 0;

// Updates the game each frame
function tick(ticker) {
    try {
        switch (window.state) {
            case "play-button":
                tickPlayButton(ticker);
                break;
            case "title":
                tickTitle(ticker);
                break;
            case "gameplay":
                tickGameplay(ticker);
                break;
            case "gameover":
                tickGameover(ticker);
                break;
        }
    }
    catch (e) {
        notifyError(e);
    }

    // Update post processing
    crtFilter.time += ticker.deltaTime * 0.4;

    // Scroll the page background over time
    window.bgScroll += ticker.deltaTime * 0.1;
    document.body.style.backgroundPositionX = -bgScroll + "px";
    document.body.style.backgroundPositionY = bgScroll + "px";
}
