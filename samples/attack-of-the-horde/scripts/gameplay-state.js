const tileSize = 16;
const gridWidth = 22;
const defenseRow = 11;

let timeSurvived;
let wave;
let waveDelay;
let waveSpawnCount;
let waveSpawnDelay;
let resourceCount;

let player;

let bulletContainer;

let enemyContainer;
let syncedStrafeTimer;
const beatLength = 28.57142857142857;

let defenseContainer;
const barricadeCost = 4;
const explosiveCost = 6;

let waveDisplay;
let resourceCountDisplay;
let resourceCountFlashTime;
let healthBar;

let stageShakeDuration;
let stageShakeTime;
let stageShakeIntensity;

// Initializes the state
function initGameplay() {
    timeSurvived = 0;
    wave = 0;
    waveDelay = 240;
    waveSpawnCount = 0;
    waveSpawnDelay = 0;
    resourceCount = 3;
    resourceCountFlashTime = 0;

    syncedStrafeTimer = -beatLength * 2;

    // Create the background
    const gameplayBackground = PIXI.Sprite.from("images/gameplay-background.png");
    app.stage.addChild(gameplayBackground);

    // Create the enemy container for ordering
    enemyContainer = new PIXI.Container();
    app.stage.addChild(enemyContainer);

    // Create the defenses container for ordering
    defenseContainer = new PIXI.Container();
    app.stage.addChild(defenseContainer);

    // Create the player
    player = new Player();
    app.stage.addChild(player);

    // Create the bullet container for ordering
    bulletContainer = new PIXI.Container();
    app.stage.addChild(bulletContainer);

    // Create an initial zombie for the player to shoot when the game starts
    const startZombie = new Zombie(0.2);
    startZombie.x = player.x;
    startZombie.y = tileSize * 6;
    startZombie.startingPos = startZombie.x;
    player.shoot();

    // Create the hud
    const hud = PIXI.Sprite.from("images/hud.png");
    app.stage.addChild(hud);

    // Create the display number for the wave
    waveDisplay = new NumberDisplay(204, 8, 0, 0xffffff);
    app.stage.addChild(waveDisplay);

    // Create the display number for the current resource count
    resourceCountDisplay = new NumberDisplay(32, 236, 0, 0xffffff);
    app.stage.addChild(resourceCountDisplay);

    // Create the health display bar
    healthBar = new PIXI.Graphics();
    updateHealthBar();
    app.stage.addChild(healthBar);

    // Create the screen fade overlay
    screenFader = new ScreenFader(0xffffff);
    app.stage.addChild(screenFader);

    // Create intial defenses
    new Barricade(tileSize);
    new Barricade(player.x);
    new Barricade(gridWidth * tileSize);

    stageShakeIntensity = 0;
    stageShakeTime = 0;

    gameplayMusic.play();
    startGameSound.play();
}

// Updates each frame
function tickGameplay(ticker) {
    timeSurvived += ticker.deltaTime / 60 / 60;

    // Screen/stage shake effect
    if (stageShakeTime > 0) {
        stageShakeTime -= ticker.deltaTime;
        if (stageShakeTime < 0)
            stageShakeTime = 0;
        app.stage.x = (Math.random() - 0.5) * 2 * (stageShakeTime / stageShakeDuration) * stageShakeIntensity;
    }

    // Wave logic
    if (waveDelay > 0) {
        waveDelay -= ticker.deltaTime;
        if (waveDelay <= 0) // When a new wave begins
        {
            wave++;
            waveDisplay.setNumber(wave);
        }
    }
    else
        waveTick(ticker);

    player.tick(ticker);

    for (let bullet of bulletContainer.children)
        bullet.tick(ticker);

    // Synchronized strafe logic
    if (wave > 0)
        syncedStrafeTimer += ticker.deltaTime;
    let strafe = false;
    if (syncedStrafeTimer >= beatLength * 4) {
        syncedStrafeTimer -= beatLength * 4;
        strafe = true;
    }

    for (let enemy of enemyContainer.children) {
        enemy.tick(ticker);
        if (strafe)
            enemy.strafe();
    }

    for (let defense of defenseContainer.children)
        defense.tick(ticker);

    if (resourceCountFlashTime > 0) {
        resourceCountFlashTime -= ticker.deltaTime * 0.2;
        resourceCountDisplay.renderable = Math.ceil(resourceCountFlashTime) % 2 == 0;
    }

    screenFader.tick(ticker);
}

// Updates the current wave
function waveTick(ticker) {
    const difficultyFactor = (wave - 1) / 15;

    if (waveSpawnDelay > 0)
        waveSpawnDelay -= ticker.deltaTime;
    else {
        const speed = lerp(0.2, 0.45, difficultyFactor);
        if ((wave == 3 && waveSpawnCount == 0) || (wave >= 4 && Math.random() <= lerp(0, 0.5, difficultyFactor)))
            new SpitterZombie(speed);
        else
            new Zombie(speed);
        waveSpawnCount++;
        waveSpawnDelay += lerp(120, 60, difficultyFactor);
    }

    if (waveSpawnCount >= lerp(4, 32, difficultyFactor)) {
        waveDelay = lerp(400, 800, difficultyFactor);
        waveSpawnCount = 0;
        waveSpawnDelay = 0;
    }
}

// Call to update the visuals of the health bar to match the current health
function updateHealthBar() {
    healthBar.clear();
    healthBar.rect(98, 236, 188 * (player.health / player.maxHealth), 8);
    healthBar.fill(0xffffff);
}

// Base class for anything that has health
class Damageable extends PIXI.AnimatedSprite {
    health;
    maxHealth;
    healthFlashTime;
    healthFlashSpeed;

    constructor(images, maxHealth) {
        super(images);
        super.play();

        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.healthFlashTime = 0;
        this.healthFlashSpeed = 0.04;
    }

    // Ticked by the gameplay state
    tick(ticker) {
        // Health damage flash
        if (this.healthFlashTime > 0) {
            this.healthFlashTime -= ticker.deltaTime * this.healthFlashSpeed;
            if (this.healthFlashTime < 0)
                this.healthFlashTime = 0;
            super.tint = lerpRedColor(this.healthFlashTime);
        }
    }

    // Called when damaged
    damage(amount = 1) {
        if (this.health <= 0)
            return;
        this.health -= amount;
        this.healthFlashTime = 1;
    }
}

// Handles the player logic
class Player extends Damageable {
    buildTimer;
    shootTimer;

    constructor() {
        super([
            PIXI.Assets.cache.get("images/player-0.png"),
            PIXI.Assets.cache.get("images/player-1.png"),
            PIXI.Assets.cache.get("images/player-0.png"),
            PIXI.Assets.cache.get("images/player-2.png")
        ], 7);
        super.x = app.screen.width / 2 - tileSize;
        super.y = defenseRow * tileSize + tileSize;
        super.animationSpeed = 0.08;
        this.healthFlashSpeed = 0.02;

        this.buildTimer = 0;
        this.shootTimer = 0;
    }

    // Ticked by the gameplay state
    tick(ticker) {
        super.tick(ticker);

        // Health damage flash
        healthBar.tint = super.tint;

        // Disable input while building
        if (this.buildTimer > 0) {
            this.buildTimer -= ticker.deltaTime;
            return;
        }

        // Movement input
        if (isKeyDownA) {
            super.x -= ticker.deltaTime * 1.3;
            if (super.x < tileSize)
                super.x = tileSize;
        } else if (isKeyDownD) {
            super.x += ticker.deltaTime * 1.3;
            if (super.x > app.screen.width - super.width - tileSize)
                super.x = app.screen.width - super.width - tileSize;
        }

        // Shooting input
        if (this.shootTimer > 0)
            this.shootTimer -= ticker.deltaTime;
        else if (isKeyDownW)
            this.shoot();

        // Building input
        if (isKeyDownQ || isKeyDownE)
            this.build();
    }

    // Shoots a bullet
    shoot() {
        if (this.shootTimer > 0)
            return;
        this.shootTimer = 42;
        new Bullet(super.x, super.y, -1.25, "player");
        shootSound.play();
    }

    // Called when damaged
    damage(amount = 1) {
        if (this.health <= 0)
            return;
        super.damage(amount);

        updateHealthBar();
        stageShakeIntensity = 4;
        stageShakeDuration = 60;
        stageShakeTime = stageShakeDuration;

        if (this.health <= 0) {
            gameplayMusic.stop();
            setState("gameover");
        }
        else
            playerHurtSound.play();
    }

    // Attempts to build at the player's position if possible
    build() {
        // First, check if the player has the resources to build
        let validResource = (isKeyDownQ && resourceCount >= barricadeCost) ||
            (isKeyDownE && resourceCount >= explosiveCost);

        // Next, ensure that there isn't already a defense at that spot
        const gridPos = Math.round(super.x / 16) * tileSize;
        let validPos = true;
        if (validResource) {
            for (let defense of defenseContainer.children) {
                if (defense.x == gridPos) {
                    validPos = false;
                    break;
                }
            }
        }

        if (validResource && validPos) {
            if (isKeyDownQ) {
                resourceCount -= barricadeCost;
                new Barricade(gridPos)
            }
            else {
                resourceCount -= explosiveCost;
                new Explosive(gridPos);
            }

            resourceCountDisplay.setNumber(resourceCount);
            this.buildTimer = 80;
            buildSound.play();
        } else if (!buildErrorSound.isPlaying) {
            if (!validResource)
                resourceCountFlashTime = 5;
            buildErrorSound.play();
        }
    }
}

// Handles individual bullet logic
class Bullet extends PIXI.AnimatedSprite {
    direction;
    type;

    constructor(x, y, direction, type, images = [PIXI.Assets.cache.get("images/bullet.png")]) {
        super(images);
        super.x = x + super.width / 2;
        super.y = y;
        super.animationSpeed = 0.16;
        super.play();

        this.direction = direction;
        super.y += Math.sign(direction) * super.height / 2;
        this.type = type;

        bulletContainer.addChild(this);
    }

    // Ticked by the gameplay state
    tick(ticker) {
        super.y += this.direction * ticker.deltaTime * 1.75;
        if ((super.y <= -super.height) || (super.y >= app.screen.height + super.height))
            bulletContainer.removeChild(this);

        if (this.type == "player") {
            for (let enemy of enemyContainer.children) {
                if (boundsOverlap(super.getBounds(), enemy.getBounds()) && enemy.health > 0) {
                    enemy.damage();
                    bulletContainer.removeChild(this);
                }
            }
        }
        else {
            if (boundsOverlap(super.getBounds(), player.getBounds()) && player.health > 0) {
                player.damage();
                bulletContainer.removeChild(this);
            }
        }
    }
}

// Handles general zombie logic
class Zombie extends Damageable {
    speed;
    resourceWorth;

    startingPos;
    strafeOffset = 0;
    strafeDirection;

    blocker;

    hasCausedDamage;

    constructor(speed, images = [
        PIXI.Assets.cache.get("images/zombie-0.png"),
        PIXI.Assets.cache.get("images/zombie-1.png"),
        PIXI.Assets.cache.get("images/zombie-0.png"),
        PIXI.Assets.cache.get("images/zombie-2.png")
    ], maxHealth = 1) {
        super(images, maxHealth);
        super.x = Math.round(Math.random() * (gridWidth - 1)) * tileSize + tileSize;
        super.y = -super.height;
        super.animationSpeed = 0.08;

        this.speed = speed;
        this.resourceWorth = 1;

        this.startingPos = super.x;
        this.strafeOffset = 0;
        this.strafeDirection = Math.random() >= 0.5 ? 1 : -1;

        this.blocker = null;

        this.hasCausedDamage = false;

        enemyContainer.addChild(this);
    }

    // Ticked by the gameplay state
    tick(ticker) {
        super.tick(ticker);

        if (this.health <= 0) // Do nothing if dead
            return;

        // Don't strafe while at the defense line
        let strafe = this.strafeOffset;
        if (super.y >= defenseRow * tileSize - tileSize)
            strafe = 0;

        // Strafe
        super.x = lerp(super.x, this.startingPos + strafe * (tileSize * 0.5 + 1), ticker.deltaTime * 0.5);

        // Move down
        super.y += ticker.deltaTime * this.speed;
        const offScreen = super.y >= app.screen.height + super.height;
        if (offScreen)
            enemyContainer.removeChild(this);
        else if (super.y >= defenseRow * tileSize - tileSize && super.y < defenseRow * tileSize) {
            // Detect and get blocked by defenses
            this.blocker = null;
            for (let defense of defenseContainer.children) {
                if (defense.x == this.startingPos) {
                    this.blocker = defense;
                    super.y = defenseRow * tileSize - tileSize;
                    break;
                }
            }
        }

        // Damage the player if the zombie reaches the bottom or touches them
        if (!this.hasCausedDamage && (offScreen || boundsOverlap(super.getBounds(), player.getBounds()))) {
            this.hasCausedDamage = true;
            player.damage();
        }
    }

    // Moves the zombie left/right
    strafe() {
        if (this.health <= 0)
            return;

        this.strafeOffset += this.strafeDirection;
        this.strafeDirection *= -1;

        if (this.blocker != null)
            this.blocker.damage();
    }

    // Called when damaged
    damage(amount = 1) {
        if (this.health <= 0)
            return;
        super.damage(amount);
        if (this.health <= 0) {
            resourceCount += this.resourceWorth;
            resourceCountDisplay.setNumber(resourceCount);

            super.textures = [
                PIXI.Assets.cache.get("images/zombie-particles-0.png"),
                PIXI.Assets.cache.get("images/zombie-particles-1.png"),
                PIXI.Assets.cache.get("images/zombie-particles-2.png"),
                PIXI.Assets.cache.get("images/zombie-particles-3.png")
            ]
            super.loop = false;
            super.animationSpeed = 0.14;
            super.play();
            super.onComplete = () => enemyContainer.removeChild(this);

            zombieKilledSound.play();
        }
        else
            zombieHurtSound.play();
    }
}

// Handles spitter zombie logic
class SpitterZombie extends Zombie {
    constructor(speed) {
        super(speed, [
            PIXI.Assets.cache.get("images/spitter-zombie-0.png"),
            PIXI.Assets.cache.get("images/spitter-zombie-1.png"),
            PIXI.Assets.cache.get("images/spitter-zombie-0.png"),
            PIXI.Assets.cache.get("images/spitter-zombie-2.png")
        ], 2);
        this.speed = speed * 0.65;
        this.resourceWorth = 2;
    }

    // Moves the zombie left/right
    strafe() {
        super.strafe();
        if (this.strafeOffset == 0 && this.health > 0)
            this.shoot();
    }

    // Shoots a bullet
    shoot() {
        new Bullet(this.startingPos, super.y, 1, "enemy", [
            PIXI.Assets.cache.get("images/spit-0.png"),
            PIXI.Assets.cache.get("images/spit-1.png")
        ]);
        spitSound.play();
    }
}

// Base class for defense objects
class Defense extends Damageable {
    invulnerability;

    constructor(x, images, maxHealth) {
        super(images, maxHealth);
        super.x = x;
        super.y = defenseRow * tileSize;
        super.animationSpeed = 0.08;

        defenseContainer.addChild(this);
    }

    // Ticked by the gameplay state
    tick(ticker) {
        super.tick(ticker);
        if (this.invulnerability > 0)
            this.invulnerability -= ticker.deltaTime;
    }

    // Called when damaged
    damage(amount = 1) {
        if (this.health <= 0 || this.invulnerability > 0)
            return;
        super.damage(amount);
        this.invulnerability = beatLength * 2;
        if (this.health <= 0)
            destroyDefenseSound.play();
    }
}

// Barricade defenses
class Barricade extends Defense {
    constructor(x) {
        super(x, [PIXI.Assets.cache.get("images/barricade-0.png")], 3);
    }

    // Called when damaged
    damage(amount = 1) {
        if (this.health <= 0)
            return;
        super.damage(amount);
        if (this.health <= 0)
            defenseContainer.removeChild(this);
        else
            super.textures = [PIXI.Assets.cache.get(`images/barricade-${2 - (this.health - 1)}.png`)];
    }
}

// Explosive defenses
class Explosive extends Defense {
    constructor(x) {
        super(x, [PIXI.Assets.cache.get("images/explosive.png")], 3);
    }

    // Ticked by the gameplay state
    tick(ticker) {
        super.tick(ticker);
        // Damage enemies while exploding
        if (this.health <= 0) {
            for (let enemy of enemyContainer.children) {
                if (boundsOverlap(super.getBounds(), enemy.getBounds()))
                    enemy.damage(100);
            }
        }
    }

    // Called when damaged
    damage(amount = 1) {
        if (this.health <= 0)
            return;
        super.damage(amount);
        if (this.health <= 0) {
            this.healthFlashTime = 0;
            stageShakeIntensity = 4;
            stageShakeDuration = 120;
            stageShakeTime = stageShakeDuration;

            super.textures = [
                PIXI.Assets.cache.get("images/explosion-0.png"),
                PIXI.Assets.cache.get("images/explosion-1.png"),
                PIXI.Assets.cache.get("images/explosion-2.png"),
                PIXI.Assets.cache.get("images/explosion-3.png"),
                PIXI.Assets.cache.get("images/explosion-4.png"),
                PIXI.Assets.cache.get("images/explosion-5.png")
            ]
            super.x -= 32;
            super.y -= 32;
            super.loop = false;
            super.animationSpeed = 0.08;
            super.play();
            super.onComplete = () => defenseContainer.removeChild(this);

            explosionSound.play();
        }
    }
}
