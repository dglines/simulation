/**
 * Fish that eats other fish
 */
function Carnivore(game, x, y) {
    this.game = game;
    this.position = new Vector(x + 70, y +70);
    this.velocity = new Vector(2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5));
    //this.velocity = new Vector(Math.random() * 2, Math.radom()00 * 2);
    this.acceleration = new Vector(0, 0);
    this.accelerationTimer = 0;  // to help smooth out random movement
    this.maxSpeed = 5;
    this.movingRight = false;

    this.boundingCircle = new BoundingCircle(this.position.x, this.position.y, 70);
    this.vision = new BoundingCircle(this.position.x, this.position.y, 600);
    this.drawCircles = false;
    this.hungerClock =  5 +(Math.random() * 15);
    this.hungerLevel = 4;
    this.bellyUp = false;

console.log("carnivore in the tank!");
    this.Lanimation = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 0, 160, 125, 0.05, 10, true, false);
    this.Ranimation = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 600, 160, 125, 0.05, 10, true, true);

    this.LEat = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 125, 160, 130, 0.05, 10, false, false);
    this.REat = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 725, 160, 130, 0.05, 10, false, true);

    // this.Lturn = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 250, 160, 130, 0.05, 10, false, true);
    // this.Rturn = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 850, 160, 130, 0.05, 10, false, false);

    this.LDeath = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 380, 160, 130, 0.05, 10, false, false);
    this.RDeath = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 975, 160, 130, 0.05, 10, false, true);

    this.LDeadFish = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 1445, 380, 160, 130, 1, 1, true, true);
    this.RDeadFish = new Animation(game, ASSET_MANAGER.getAsset("./img/carnivore.png"), 0, 980, 160, 130, 1, 1, true, true);
    Entity.call(game, this.position.x, this.position.y);
}

Carnivore.prototype = new Entity();
Carnivore.prototype.constructor = Carnivore;

Carnivore.prototype.update = function() {
    // update location
    this.accelerationTimer += this.game.clockTick;
    if (this.accelerationTimer >= 0.5 && !this.bellyUp) {
        // random-ish movement
        this.acceleration.set((Math.random() - 0.5)/10, (Math.random() - 0.5)/10);
        this.acceleration.mult(3 * Math.random());
        this.accelerationTimer = 0;
    }
    if (this.hungerLevel >= 3 && this.position.y < 500) {
        this.acceleration.y += 0.01;
        this.acceleration.x *= 1.2;
    }

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    if (this.bellyUp && this.position.y - 70 <= 0) {
        this.position.y = 70;
    }

    this.boundingCircle.set(this.position.x, this.position.y);
    this.vision.set(this.position.x, this.position.y);

    if (this.velocity.x > 0) {
        this.movingRight = true;
        this.boundingCircle.x += 20;
    } else {
        this.movingRight = false;
    }

    // slow down x movement on dead Fish
    if (this.bellyUp && this.velocity.x > 0.01) {
        this.velocity.x -= 0.01;
        this.velocity.y -= 0.1;
    }

    // update hunger status
    this.hungerClock -= this.game.clockTick;
    if (this.hungerClock <= 0) {
        this.hungerLevel--;
        this.hungerClock = 5 +(Math.random() * 15);
        if (this.hungerLevel <= 0) {
            this.bellyUp = true;
            this.velocity.normalize();
            this.velocity.y = -(Math.random() - 1);
        }
    }

    // food
    if (!this.bellyUp && this.hungerLevel < 3) {
        this.findFood();
    }

    if (this.boundingCircle.leftWall()) {
        //this.turnRight = true;
        this.position.x = 70;
        this.velocity.x = -this.velocity.x;
    } else if (this.boundingCircle.rightWall()) {
        //this.turnLeft = true;
        this.position.x = 1530;
        this.velocity.x = -this.velocity.x;
    } else if (this.boundingCircle.bottom() || this.boundingCircle.surface()) {
        this.velocity.y = -this.velocity.y/1.05;
    }

    // if (this.Lturn.isDone()) {
    //     this.turnLeft = false;
    //     this.Lturn.elapsedTime = 0;
    // }
    // if (this.Rturn.isDone()) {
    //     this.turnRight = false;
    //     this.Rturn.elapsedTime = 0;
    // }
    if (this.LEat.isDone() || this.REat.isDone()) {
        this.bite = false;
        this.LEat.elapsedTime = 0;
        this.REat.elapsedTime = 0;
    }

    Entity.prototype.update.call(this);
}

Carnivore.prototype.findFood = function() {
    var closestDist = 100000;
    var nextFood;
    // find closest meat
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent instanceof Fish && this.vision.collide(ent.boundingCircle)) {
            var dist = this.position.dist(ent.position);
            if (dist < closestDist){
                closestDist = dist;
                nextFood = ent;
            }
        }
    }
    // move to closest
    if (nextFood != undefined){
        var loc = new Vector(this.position.x, this.position.y);
        var direction = new Vector(nextFood.position.x, nextFood.position.y);
        direction.sub(loc);
        direction.normalize();
        direction.mult(0.3);  // speed
        this.acceleration = direction;
        this.velocity.add(this.acceleration);

        if (this.boundingCircle.collide(nextFood.boundingCircle)) {
            this.bite = true;
            nextFood.isEaten = true;
            this.hungerLevel = 3;
            this.hungerClock = 5 +(Math.random() * 15);
        };
    };


};

Carnivore.prototype.draw = function(ctx) {

    // if (!this.bellyUp && this.turnLeft) {
    //     this.Lturn.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
    // } else if (!this.bellyUp && this.turnRight) {
    //     this.Rturn.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);

    if (this.movingRight) {
        if (this.bellyUp) {
            if (this.RDeath.isDone()) {
                this.RDeadFish.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
            } else {
                this.RDeath.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
            }
        } else if (this.bite) {
            this.REat.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
        } else {
            this.Ranimation.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
        }
    } else {
        if (this.bellyUp) {
            if (this.LDeath.isDone()) {
                this.LDeadFish.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
            } else {
                this.LDeath.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
            }
        } else if (this.bite) {
            this.LEat.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
        } else
            this.Lanimation.drawFrame(this.game.clockTick, ctx, this.position.x - 70, this.position.y - 70, 1);
    }

    ctx.strokeStyle = "red";
    ctx.font = "12pt Impact";
    ctx.fillStyle = "red";
    var text = this.getHungerState();
    var x = this.position.x;
    if (this.velocity.x < 0) {
        x -= 75;
    } else {
        x += 75;
    }
    ctx.fillText(text, x, this.position.y - 40);

    if (this.drawCircles) {
        this.boundingCircle.draw(ctx);
        this.vision.draw(ctx);
    }
    Entity.prototype.draw.call(this);
};

Carnivore.prototype.getHungerState = function() {
    if (this.hungerLevel >= 3) {
        return "full";
    } else if (this.hungerLevel ==2) {
        return "hungry";
    } else if (this.hungerLevel == 1) {
        return "starving";
    }
    return "starved to death";
}
