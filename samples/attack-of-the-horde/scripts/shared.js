let titleMusic;
let gameplayMusic;
let titleVoiceSound;
let startGameSound;
let playerHurtSound;
let playerKilledSound;
let shootSound;
let zombieKilledSound;
let spitSound;
let buildSound;
let explosionSound;

// Loads all assets used by the game
async function loadAssets() {
    // Load images
    await PIXI.Assets.load("images/play-button.png");
    await PIXI.Assets.load("images/num-0.png");
    await PIXI.Assets.load("images/num-1.png");
    await PIXI.Assets.load("images/num-2.png");
    await PIXI.Assets.load("images/num-3.png");
    await PIXI.Assets.load("images/num-4.png");
    await PIXI.Assets.load("images/num-5.png");
    await PIXI.Assets.load("images/num-6.png");
    await PIXI.Assets.load("images/num-7.png");
    await PIXI.Assets.load("images/num-8.png");
    await PIXI.Assets.load("images/num-9.png");
    await PIXI.Assets.load("images/num-decimal.png");
    await PIXI.Assets.load("images/logo.png");
    await PIXI.Assets.load("images/instructions.png");
    await PIXI.Assets.load("images/gameplay-background.png");
    await PIXI.Assets.load("images/hud.png");
    await PIXI.Assets.load("images/player-0.png");
    await PIXI.Assets.load("images/player-1.png");
    await PIXI.Assets.load("images/player-2.png");
    await PIXI.Assets.load("images/bullet.png");
    await PIXI.Assets.load("images/zombie-0.png");
    await PIXI.Assets.load("images/zombie-1.png");
    await PIXI.Assets.load("images/zombie-2.png");
    await PIXI.Assets.load("images/spitter-zombie-0.png");
    await PIXI.Assets.load("images/spitter-zombie-1.png");
    await PIXI.Assets.load("images/spitter-zombie-2.png");
    await PIXI.Assets.load("images/zombie-particles-0.png");
    await PIXI.Assets.load("images/zombie-particles-1.png");
    await PIXI.Assets.load("images/zombie-particles-2.png");
    await PIXI.Assets.load("images/zombie-particles-3.png");
    await PIXI.Assets.load("images/spit-0.png");
    await PIXI.Assets.load("images/spit-1.png");
    await PIXI.Assets.load("images/barricade-0.png");
    await PIXI.Assets.load("images/barricade-1.png");
    await PIXI.Assets.load("images/barricade-2.png");
    await PIXI.Assets.load("images/explosive.png");
    await PIXI.Assets.load("images/explosion-0.png");
    await PIXI.Assets.load("images/explosion-1.png");
    await PIXI.Assets.load("images/explosion-2.png");
    await PIXI.Assets.load("images/explosion-3.png");
    await PIXI.Assets.load("images/explosion-4.png");
    await PIXI.Assets.load("images/explosion-5.png");
    await PIXI.Assets.load("images/gameover-title.png");
    await PIXI.Assets.load("images/gameover.png");

    // Load sounds
    await PIXI.Assets.load("sounds/title-music.ogg");
    await PIXI.Assets.load("sounds/gameplay-music.ogg");
    await PIXI.Assets.load("sounds/title-voice.ogg");
    await PIXI.Assets.load("sounds/start-game.ogg");
    await PIXI.Assets.load("sounds/player-hurt.ogg");
    await PIXI.Assets.load("sounds/player-killed.ogg");
    await PIXI.Assets.load("sounds/shoot.ogg");
    await PIXI.Assets.load("sounds/zombie-hurt.ogg");
    await PIXI.Assets.load("sounds/zombie-killed.ogg");
    await PIXI.Assets.load("sounds/spit.ogg");
    await PIXI.Assets.load("sounds/build.ogg");
    await PIXI.Assets.load("sounds/build-error.ogg");
    await PIXI.Assets.load("sounds/destroy-defense.ogg");
    await PIXI.Assets.load("sounds/explosion.ogg");

    // Set up cached sound objects for re-use
    titleMusic = PIXI.sound.Sound.from("sounds/title-music.ogg");
    titleMusic.loop = true;
    titleMusic.volume = 0.25;
    gameplayMusic = PIXI.sound.Sound.from("sounds/gameplay-music.ogg");
    gameplayMusic.loop = true;
    gameplayMusic.volume = 0.25;
    titleVoiceSound = PIXI.sound.Sound.from("sounds/title-voice.ogg");
    titleVoiceSound.volume = 0.5;
    startGameSound = PIXI.sound.Sound.from("sounds/start-game.ogg");
    startGameSound.volume = 0.75;
    playerHurtSound = PIXI.sound.Sound.from("sounds/player-hurt.ogg");
    playerHurtSound.volume = 0.85;
    playerKilledSound = PIXI.sound.Sound.from("sounds/player-killed.ogg");
    playerKilledSound.volume = 0.75;
    shootSound = PIXI.sound.Sound.from("sounds/shoot.ogg");
    shootSound.volume = 0.1;
    zombieHurtSound = PIXI.sound.Sound.from("sounds/zombie-hurt.ogg");
    zombieHurtSound.volume = 0.5;
    zombieKilledSound = PIXI.sound.Sound.from("sounds/zombie-killed.ogg");
    zombieKilledSound.volume = 0.5;
    spitSound = PIXI.sound.Sound.from("sounds/spit.ogg");
    spitSound.volume = 0.1;
    buildSound = PIXI.sound.Sound.from("sounds/build.ogg");
    buildSound.volume = 0.85;
    buildErrorSound = PIXI.sound.Sound.from("sounds/build-error.ogg");
    buildErrorSound.volume = 0.4;
    destroyDefenseSound = PIXI.sound.Sound.from("sounds/destroy-defense.ogg");
    destroyDefenseSound.volume = 0.5;
    explosionSound = PIXI.sound.Sound.from("sounds/explosion.ogg");
    explosionSound.volume = 0.5;
}

// Linear interpolation
lerp = (a, b, t) => {
    return a * (1 - t) + b * t;
}

// Linear RGB color interpolation
lerpColor = (a, b, t) => {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

// Linear interpolation between white and a specific red color
lerpRedColor = (t) => {
    return new PIXI.Color(lerpColor([1, 1, 1], [0.882, 0.094, 0.133], t)).toNumber();
}

// Compares bounds
function boundsOverlap(bounds1, bounds2) {
    return (
        bounds1.x < bounds2.x + bounds2.width
        && bounds1.x + bounds1.width > bounds2.x
        && bounds1.y < bounds2.y + bounds2.height
        && bounds1.y + bounds1.height > bounds2.y
    );
}

// Displays number using sprites
class NumberDisplay extends PIXI.Container {
    constructor(x = 0, y = 0, number = 0, tint = 0xffffff) {
        super({
            position: new PIXI.Point(x, y)
        });
        super.tint = tint;
        this.setNumber(number);
    }

    // Sets the number and updates visuals
    setNumber(number) {
        super.removeChildren();

        let numberStr = number + "";
        let countSinceDecimal = -1;
        for (let i = 0; i < numberStr.length; i++) {
            let char = numberStr[i];

            if (countSinceDecimal >= 0) {
                countSinceDecimal++;
                if (countSinceDecimal >= 2)
                    break;
            } else if (char == ".") {
                char = "decimal";
                countSinceDecimal = 0;
            }

            const num = PIXI.Sprite.from(`images/num-${char}.png`);
            num.x = i * num.width;
            super.addChild(num);
        }
    }
}

// Flashes the screen and fades out
class ScreenFader extends PIXI.Graphics {
    fadeTime;

    constructor(color) {
        super();
        super.rect(0, 0, app.screen.width, app.screen.height);
        super.fill(color);
        this.fadeTime = 0;
    }

    tick(ticker) {
        this.fadeTime += ticker.deltaTime;
        super.alpha = 1 - this.fadeTime / 60;
    }
}
