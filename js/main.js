window.onload = function() 
{
	"use strict";

	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
	
	var ballOnPaddle = true;
	
	var cursors;
	
	var ball;
	var playerPaddle;
	var playerBricks;
	var totalPlayerBricks = 60;
	
	var computerPaddle;
	var computerBricks;
	var totalComputerBricks = 60;
	
	var gameoverText;
	var playerTilesLeftText;
	var introText;
	var cpuTilesLeftText;

	function preload() 
	{
		game.load.image('background', 'assets/landscape.png');
		game.load.image('playerPaddle', 'assets/playerPaddle.png');
		game.load.image('playerBrick', 'assets/crate.png');
		game.load.image('computerPaddle', 'assets/computerPaddle.png');
		game.load.image('computerBrick', 'assets/crate.png');
		game.load.image('ball', 'assets/heart.png');
		
	}
	 
	function create() 
	{
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		game.add.sprite(0, 0, 'background');
		
		cursors = game.input.keyboard.createCursorKeys();
		
		//brick placement
		playerBricks = game.add.group();
		playerBricks.enableBody = true;
		playerBricks.physicsBodyType = Phaser.Physics.ARCADE;

		var playerBrick;

		for (var x = 0; x < 4; x++)
		{
			for (var y = 0; y < 15; y++)
			{
				playerBrick = playerBricks.create(600 + (x * 36), 100 + (y * 52), 'playerBrick');
				playerBrick.scale.setTo(.0625, .0625);
				playerBrick.angle = 90;
				playerBrick.body.bounce.set(1);
				playerBrick.body.immovable = true;
			}
		}
		
		computerBricks = game.add.group();
		computerBricks.enableBody = true;
		computerBricks.physicsBodyType = Phaser.Physics.ARCADE;
		
		var computerBrick;

		for (var x = 0; x < 4; x++)
		{
			for (var y = 0; y < 15; y++)
			{
				computerBrick = computerBricks.create(200 - (x * 36), 100 + (y * 52), 'computerBrick');
				computerBrick.scale.setTo(.0625, .0625);
				computerBrick.angle = 90;
				computerBrick.body.bounce.set(1);
				computerBrick.body.immovable = true;
			}
		}
		
		
		//paddle settings
		playerPaddle = game.add.sprite(game.world.centerX + 125, game.world.centerY, 'playerPaddle');
		game.physics.enable(playerPaddle, Phaser.Physics.ARCADE);
		playerPaddle.scale.setTo(.5, .5);
		playerPaddle.angle = 90;
		playerPaddle.anchor.setTo(0.5, 0.5);
		game.physics.enable('playerPaddle', Phaser.Physics.ARCADE);
		
		playerPaddle.body.collideWorldBounds = true;
		playerPaddle.body.bounce.set(1);
		playerPaddle.body.immovable = true;
		
		//computer paddle settings
		computerPaddle = game.add.sprite(game.world.centerX - 175, game.world.centerY, 'computerPaddle');
		game.physics.enable(computerPaddle, Phaser.Physics.ARCADE);
		computerPaddle.scale.setTo(.5, .5);
		computerPaddle.angle = 90;
		computerPaddle.anchor.setTo(0.5, 0.5);
		game.physics.enable('computerPaddle', Phaser.Physics.ARCADE);
		
		computerPaddle.body.collideWorldBounds = true;
		computerPaddle.body.bounce.set(1);
		computerPaddle.body.immovable = true;
		
		//ball settings
		ball = game.add.sprite(playerPaddle.x - 32, playerPaddle.y - 16, 'ball');
		ball.scale.setTo(.25, .25);
		ball.anchor.set(0.5);
		ball.checkWorldBounds = true;
		game.physics.enable(ball, Phaser.Physics.ARCADE);
		ball.body.collideWorldBounds = true;
		ball.body.bounce.set(1);
		
		
		introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
		introText.anchor.setTo(0.5, 0.5);
		game.input.onDown.add(releaseBall, this);
		
		playerTilesLeftText = game.add.text(500, 16, 'Player Tiles: ' + totalPlayerBricks, { fontSize: '32px', fill: '#000' });
		
		cpuTilesLeftText = game.add.text(150, 16, 'Computer Tiles: ' + totalComputerBricks, { fontSize: '32px', fill: '#000' });
	}
	 
	function update() 
	{
		
		playerPaddle.y = game.input.y;

		if (playerPaddle.y < 24)
		{
			playerPaddle.y = 24;
		}
		else if (playerPaddle.y > game.height - 24)
		{
			playerPaddle.y = game.height - 24;
		}

		if (ballOnPaddle)
		{
			ball.body.y = playerPaddle.y;
		}
		else
		{
			game.physics.arcade.collide(ball, playerPaddle, ballHitPaddle, null, this);
			game.physics.arcade.collide(ball, computerPaddle, ballHitPaddle, null, this);
			game.physics.arcade.collide(ball, playerBricks, ballHitBrick, null, this);
			game.physics.arcade.collide(ball, computerBricks, ballHitBrick, null, this);
		}
	}

	
	function releaseBall () {

		if (ballOnPaddle)
		{
			ballOnPaddle = false;
			ball.body.velocity.y = -75;
			ball.body.velocity.x = -250;
			introText.visible = false;
		}

	}
	
	function ballHitBrick (_ball, _brick) {

    _brick.kill();
	
	//insert bricks text
	_ball.body.velocity.x += .2;
	updateComputerTiles();
	updatePlayerTiles();

    if (playerBricks.countLiving() === 0 || computerBricks.countLiving() === 0)
    {
        introText.text = '- Next Level -';

        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = playerPaddle.x - 16;
        ball.y = playerPaddle.y;

        playerBricks.callAll('revive');
	computerBricks.callAll('revive');
    }

}
	
	function ballHitPaddle (_ball, _paddle) {

		var diff = 0;

		_ball.body.velocity.x += .2;
		if (_ball.y < _paddle.y)
		{
			diff = _paddle.y - _ball.y;
			_ball.body.velocity.y = (-10 * diff);
		}
		else if (_ball.y > _paddle.y)
		{
			diff = _ball.y -_paddle.y;
			_ball.body.velocity.y = (10 * diff);
		}
		else
		{
			_ball.body.velocity.y = 2 + Math.random() * 8;
		}

	}
	
	function updatePlayerTiles()
	{
		totalPlayerBricks = playerBricks.countLiving();
		playerTilesLeftText.text = 'Player Tiles: ' + totalPlayerBricks;
		//update text
	}
	
	function updateComputerTiles()
	{
		totalComputerBricks = computerBricks.countLiving();;
		cpuTilesLeftText.text = 'Computer Tiles: ' + totalComputerBricks;
		//update text;
	}
	
	//function gameover()
	//{
	//	this.game.paused = true;
	//	gameoverText = game.add.text(350, 300, 'Game Over', { fontSize: '128px', fill: '#000' });
	//}
};
	 
