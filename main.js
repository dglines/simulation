
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
}

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.x, this.y);
};

Background.prototype.update = function () {
};



// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

// ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/bg.jpg");
ASSET_MANAGER.queueDownload("./img/carnivore.png");
ASSET_MANAGER.queueDownload("./img/fish.png");


ASSET_MANAGER.downloadAll(function () {
    console.log("starting aquarium simulation");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/bg.jpg")));

    for (var i = 0; i < 10; i++) {
        var fish = new Fish(gameEngine, (1400 * Math.random()) + 50, (100* Math.random()) + 50);
        gameEngine.addEntity(fish);
    };
    // gameEngine.addEntity( new Fish(gameEngine, (1400 * Math.random()) + 50, (700 * Math.random()) + 50));
    gameEngine.addEntity(new Carnivore(gameEngine, (1400 * Math.random()) + 50, (400 * Math.random()) + 300));

    // *****Assignment 3 stuff*****
    var socket = io.connect("http://24.16.255.56:8888");
    socket.on("connect", function () {
        console.log("Socket connected.")
    });
    socket.on("disconnect", function () {
        console.log("Socket disconnected.")
    });
    socket.on("reconnect", function () {
        console.log("Socket reconnected.")
    });

    // this.socket.on("load", function (data) {
    //     console.log(data);
    // });

});
