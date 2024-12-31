// Initializes the state
function initPlayButton()
{
    // Create the play button
    const playButton = PIXI.Sprite.from("images/play-button.png");
    playButton.x = app.screen.width / 2 - playButton.width / 2;
    playButton.y = app.screen.height / 2 - playButton.height / 2;
    app.stage.addChild(playButton);
}

// Updates each frame
function tickPlayButton(ticker)
{
    if (isPointerDown)
        setState("title");
}
