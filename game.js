class SpaceShooter extends Phaser.Scene {
  constructor() {
    super("SpaceShooter");
  }

  preload() {
    this.load.image("player", "assets/player.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("enemy", "assets/enemy.png");
    this.load.image("background", "assets/background.png");
  }

  create() {
    // Background
    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "background")
      .setOrigin(0, 0);

    // Player setup
    this.player = this.physics.add.sprite(
      this.scale.width / 2,
      this.scale.height - 80,
      "player"
    );
    this.player.setCollideWorldBounds(true).setVisible(false);

    // Groups
    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.lastFired = 0;

    // Score
    this.score = 0;
    this.scoreText = this.add
      .text(20, 20, "", {
        fontSize: "24px",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setVisible(false);

    // Start screen text
    this.startText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        "Click or Press Space to Start",
        {
          fontSize: "28px",
          fill: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
          wordWrap: { width: this.scale.width - 60 },
        }
      )
      .setOrigin(0.5);

    // Game Over text
    this.gameOverText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "", {
        fontSize: "28px",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: this.scale.width - 60 },
        lineSpacing: 10,
      })
      .setOrigin(0.5)
      .setVisible(false);

    // Start triggers
    this.input.once("pointerdown", this.startGame, this);
    this.input.keyboard.once("keydown-SPACE", this.startGame, this);

    this.isGameOver = false;
    this.gameStarted = false;
  }

  startGame() {
    this.gameStarted = true;
    this.score = 0;
    this.scoreText.setText("Score: 0").setVisible(true);
    this.startText.setVisible(false);
    this.player.setVisible(true);
    this.player.setTint(0xffffff);
    this.player.setPosition(this.scale.width / 2, this.scale.height - 80);
    this.physics.resume();

    // Spawn enemies
    this.enemyTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHit,
      null,
      this
    );
  }

  update(time) {
    if (!this.gameStarted || this.isGameOver) return;

    // Scroll background
    this.background.tilePositionY -= 1;

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // Shooting
    if (
      Phaser.Input.Keyboard.JustDown(this.spacebar) &&
      time > this.lastFired + 300
    ) {
      const bullet = this.bullets.create(
        this.player.x,
        this.player.y - 20,
        "bullet"
      );
      bullet.setVelocityY(-400);
      this.lastFired = time;
    }

    // Clean up offscreen
    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.y < 0) bullet.destroy();
    });

    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.y > this.scale.height) enemy.destroy();
    });
  }

  spawnEnemy() {
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    const enemy = this.enemies.create(x, -50, "enemy");
    enemy.setVelocityY(100);
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
  }

  playerHit(player, enemy) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.isGameOver = true;

    this.scoreText.setText("Game Over! Score: " + this.score);
    this.gameOverText
      .setText("Game Over!\nClick or Press Space to Try Again")
      .setVisible(true);

    this.input.once("pointerdown", () => this.scene.restart(), this);
    this.input.keyboard.once("keydown-SPACE", () => this.scene.restart(), this);
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
  },
  scene: SpaceShooter,
  parent: "game-container",
  backgroundColor: "#000",
};

const game = new Phaser.Game(config);
