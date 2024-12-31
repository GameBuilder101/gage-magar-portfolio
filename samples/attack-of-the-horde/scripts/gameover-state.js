let gameoverTitle;
let gameoverTitleAnimTime;

// Initializes the state
function initGameover() {
    timeSinceStateInit = 0;

    // Create the game over title
    gameoverTitle = PIXI.Sprite.from("images/gameover-title.png");
    gameoverTitle.x = app.screen.width / 2 - gameoverTitle.width / 2;
    gameoverTitle.y = 8;
    app.stage.addChild(gameoverTitle);
    gameoverTitleAnimTime = 0;

    // Create the game over text
    const gameover = PIXI.Sprite.from("images/gameover.png");
    app.stage.addChild(gameover);

    // Create the number display for waves survived
    const wavesSurvivedDisplay = new NumberDisplay(196, 104, wave, 0xe11822);
    app.stage.addChild(wavesSurvivedDisplay);

    // Create the number display for time survived
    const timeSurvivedDisplay = new NumberDisplay(196, 120, timeSurvived);
    app.stage.addChild(timeSurvivedDisplay);

    // Get the high score from browser storage and set it if a new score was reached
    let highScore = localStorage.getItem("gjm5250-high-score");
    if (highScore == null)
        highScore = 0;
    if (wave > highScore)
    {
        highScore = wave;
        localStorage.setItem("gjm5250-high-score", highScore);
    }

    // Create the number display for the highest waves survived
    const highScoreDisplay = new NumberDisplay(196, 152, highScore, 0xe11822);
    app.stage.addChild(highScoreDisplay);

    // Create the screen fade overlay
    screenFader = new ScreenFader(0xe11822);
    app.stage.addChild(screenFader);

    if (!titleMusic.isPlaying)
        titleMusic.play();
    playerKilledSound.play();
}

// Updates each frame
function tickGameover(ticker) {
    gameoverTitleAnimTime += ticker.deltaTime * 0.05;
    gameoverTitle.y = 8 - Math.sin(gameoverTitleAnimTime) * 3;

    screenFader.tick(ticker);

    if (isKeyDownW && timeSinceStateInit >= 120)
        setState("title");
    timeSinceStateInit += ticker.deltaTime;
}
