    // *****Assignment 33 stuff*****
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

socket.on("load", function (data) {
    console.log("Loading");
    recoverState(data);
});


var gameEngine;
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

    gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/bg.jpg")));

    for (var i = 0; i < 10; i++) {
        var fish = new Fish(gameEngine, (1400 * Math.random()) + 50, (100* Math.random()) + 50);
        gameEngine.addEntity(fish);
    };
    // gameEngine.addEntity( new Fish(gameEngine, (1400 * Math.random()) + 50, (700 * Math.random()) + 50));
    gameEngine.addEntity(new Carnivore(gameEngine, (1400 * Math.random()) + 50, (400 * Math.random()) + 300));


    console.log(gameEngine.entities.length);
});
function SaveState() {
    console.log("Saving");
    var state = [];
    for (var i = 0; i < gameEngine.entities.length; i++) {
        var ent = gameEngine.entities[i];
        if (ent instanceof Fish || ent instanceof Carnivore) {
            state.push(ent.position);
            state.push(ent.velocity);
            state.push(ent.acceleration);
            state.push(ent.accelerationTimer);
            state.push(ent.OGVelocity);

            state.push(ent.hungerClock);
            state.push(ent.hungerLevel);
            state.push(ent.movingRight);
            state.push(ent.bellyUp);
        } else if (ent instanceof FishFood) {
            state.push(ent.position);
            state.push(ent.sinkRate);
            state.push(ent.size);
        }
    }
    socket.emit("save", { studentname: "David Glines", statename: "gameStateTest", data: state });
}

function LoadState() {
    socket.emit("load", { studentname: "David Glines", statename: "gameStateTest"});
}

function recoverState(data) {
    var arr = data.data;
    var index = 0;
    for (var i = 0; i < gameEngine.entities.length; i++) {
        var ent = gameEngine.entities[i];
        if (ent instanceof Fish || ent instanceof Carnivore) {
            var value = arr[index++];

            ent.position.x = value.x;
            ent.position.y = value.y
            value = arr[index++];
            ent.velocity.x = value.x;
            ent.velocity.y = value.y;
            value = arr[index++];
            ent.acceleration.x = value.x;
            ent.acceleration.y = value.y;
            ent.accelerationTimer = arr[index++];
            value = arr[index++];
            ent.OGVelocity.x = value.x;
            ent.OGVelocity.y = value.y;
            ent.hungerClock = arr[index++];
            ent.hungerLevel = arr[index++];
            ent.movingRight = arr[index++];
            ent.bellyUp = arr[index++];
        } else if (ent instanceof FishFood) {
            value = arr[index++];
            ent.position.x = value.x;
            ent.position.y = value.y;
            value = arr[index++];
            ent.sinkRate.x = value.x;
            ent.sinkRate.y = value.y;
            ent.size = arr[index++];
        }
    }
    console.log("Done Loading");

}
