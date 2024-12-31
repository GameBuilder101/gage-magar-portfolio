let timeSinceStateInit;

let logo;
let logoAnimTime;

let screenFader;

// Initializes the state
function initTitle() {
    timeSinceStateInit = 0;

    // Create the logo
    logo = PIXI.Sprite.from("images/logo.png");
    logo.x = app.screen.width / 2 - logo.width / 2;
    logo.y = 8;
    app.stage.addChild(logo);
    logoAnimTime = 0;

    // Create the game instructions
    const instructions = PIXI.Sprite.from("images/instructions.png");
    app.stage.addChild(instructions);

    // Create the screen fade overlay
    screenFader = new ScreenFader(0xffffff);
    app.stage.addChild(screenFader);

    if (!titleMusic.isPlaying)
        titleMusic.play();
    titleVoiceSound.play();
}

// Updates each frame
function tickTitle(ticker) {
    logoAnimTime += ticker.deltaTime * 0.05;
    logo.y = 8 - Math.sin(logoAnimTime) * 3;

    screenFader.tick(ticker);

    if (isKeyDownW && timeSinceStateInit >= 60) {
        titleMusic.stop();
        setState("gameplay");
    }
    timeSinceStateInit += ticker.deltaTime;
}
