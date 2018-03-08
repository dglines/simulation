/**
 * fish
 * Hunger: 3=full, 2=hungary, 1=starving, 0=dead
 */
function Fish(game, x, y) {
    this.game = game;
    this.position = new Vector(x + 40, y + 40);
    var xSpeed = 3 * (Math.random() - 0.4)
    var ySpeed =  2 * (Math.random() - 0.4)
    this.velocity = new Vector(xSpeed, ySpeed);
    this.acceleration = new Vector(0, 0);
    this.accelerationTimer = 0;  // to help smooth out random movement
    this.OGVelocity = new Vector(xSpeed, ySpeed);
    this.maxSpeed = 3;

    this.boundingCircle = new BoundingCircle(this.position.x, this.position.y, 35);
    this.vision = new BoundingCircle(this.position.x, this.position.y, 200);
    this.drawCircles = false;
    this.hungerClock =  5 +(Math.random() * 15);
    this.hungerLevel = 4;
    this.movingRight = false;
    this.bellyUp = false;
    this.isEaten = false;


    this.Lanimation = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 10, 0, 80, 80, 0.1, 10, true, false);
    this.Ranimation = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 13, 340, 80, 80, 0.1, 10, true, true);
    // this.Rturn = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 10, 95, 80, 80, 0.05, 10, false, false);
    // this.Lturn = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 13, 425, 80, 80, 0.05, 10, false, true);
    this.LDeath = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 13, 260, 80, 80, 0.05, 10, false, false);
    this.RDeath = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 13, 595, 80, 80, 0.05, 10, false, true);
    this.LDeadFish = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 733, 260, 80, 80, 1, 1, true, true);
    this.RDeadFish = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 10, 595, 80, 80, 1, 1, true, true);
    this.LEat = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 10, 180, 80, 80, .05, 10, false, false);
    this.REat = new Animation(game, ASSET_MANAGER.getAsset("./img/fish.png"), 13, 515, 80, 80, .05, 10, false, true);
    Entity.call(game, this.position.x, this.position.y);
};

Fish.prototype = new Entity();
Fish.prototype.constructor = Fish;

Fish.prototype.update = function() {
    // update location
    this.accelerationTimer += this.game.clockTick;
    if (this.accelerationTimer >= 0.5) {
        // random-ish movement
        if (!this.bellyUp) {
            this.acceleration.set((Math.random() - 0.5)/10, (Math.random() - 0.5)/10);
            this.acceleration.mult(5 * Math.random());
            this.accelerationTimer = 0;
        } else {
            this.acceleration.y -= 0.01;
        }
    }
    if (this.position.y > 300) {
        this.acceleration.y -= 0.05;
    }

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    if (this.bellyUp && this.position.y - 40 <= 0) {
        this.position.y = 30;
    }

    this.boundingCircle.set(this.position.x, this.position.y);
    this.vision.set(this.position.x, this.position.y);

    if (this.velocity.x > 0) {
        this.movingRight = true;
    } else {
        this.movingRight = false;
    }

    // slow down x movement on dead Fish
    if (this.bellyUp && (this.velocity.x > 0.1 || this.velocity.x < 0.1)) {
        this.velocity.x /= 1.2;
    }


    if (!this.bellyUp){
        this.hungerClock -= this.game.clockTick;

        for(var i = 0; i < this.game.entities.length; i++) {
            var ent = this.game.entities[i];
            if (ent instanceof FishFood && this.hungerLevel < 3){
                this.findFood();
            }
            if (ent instanceof Carnivore && this.vision.collide(ent.boundingCircle)) {
                this.run(ent);
                this.fleeing = true;
            }
         }
    }

    if (this.hungerClock <= 0) {
        this.hungerLevel--;
        this.hungerClock = 5 +(Math.random() * 15);
        if (this.hungerLevel <= 0) {
            this.bellyUp = true;
            this.velocity.normalize();
            this.velocity.y = Math.random() - 1;
        }
    }

    if (!this.fleeing) {
        this.velocity = this.OGVelocity;
        this.acceleration.mult(0);
    }

    if (this.boundingCircle.leftWall()) {
        // if (!this.bellyUp) this.turnRight = true;
        if (!this.bellyUp) this.velocity.x = -this.velocity.x;
        this.position.x = 40;
    } else if (this.boundingCircle.rightWall()) {
        // if (!this.bellyUp) this.turnLeft = true;
        if (!this.bellyUp) this.velocity.x = -this.velocity.x;
        this.position.x = 1560;
    } else if (this.boundingCircle.bottom() || this.boundingCircle.surface()) {
        this.velocity.y = -this.velocity.y/1.05;
        if (this.position.y < 40) {
            this.position.y = 40
        }
    }
    if (this.LEat.isDone() || this.REat.isDone()) {
        this.bite = false;
        this.LEat.elapsedTime = 0;
        this.REat.elapsedTime = 0;
    }
    // if (this.Lturn.isDone()) {
    //     this.turnLeft = false;
    //     this.Lturn.elapsedTime = 0;
    // }
    // if (this.Rturn.isDone()) {
    //     this.turnRight = false;
    //     this.Rturn.elapsedTime = 0;
    // }
    if (this.isEaten) {
        this.removeFromWorld = true;
    }
    //console.log(this.position.x, this.position.y);
    Entity.prototype.update.call(this);
};

Fish.prototype.run = function(other) {
    var difX = this.position.x - other.position.x;
    var difY = this.position.y - other.position.y;

    var dir = new Vector(difX, difY);
    //dir.mult(-1);
    dir.normalize();
    dir.mult(0.2);  // slower speed?
    this.acceleration = dir;
    this.velocity.add(this.acceleration);

}

Fish.prototype.findFood = function() {
    var closestDist = 10000;
    var nextFood;
    for (var i=0; i < this.game.entities.length; i++) {
        var food = this.game.entities[i];
        if (food instanceof FishFood && this.vision.collide(food.boundingCircle)) {
            var dist = this.position.dist(food.position);
            if (dist < closestDist) {
                closestDist = dist;
                nextFood = food;
            }
        }
    }
    if (nextFood != undefined) {
        var loc = new Vector(this.position.x, this.position.y);
        var direction = new Vector(nextFood.position.x, nextFood.position.y);
        direction.sub(loc);
        direction.normalize();
        direction.mult(0.3);  // speed
        this.acceleration = direction;
        this.velocity.add(this.acceleration);

        if (this.boundingCircle.collide(nextFood.boundingCircle)) {
            nextFood.isEaten();
            this.bite = true;
            this.hungerLevel = 3;
            this.hungerClock = 5 +(Math.random() * 15);
        };
    }
}

Fish.prototype.draw = function(ctx) {

    // if (!this.bellyUp && this.turnLeft) {
    //     this.Lturn.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);
    // } else if (!this.bellyUp && this.turnRight) {
    //     this.Rturn.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);

    if (this.movingRight) {
        if (this.bellyUp) {
            if (this.RDeath.isDone()) {
                this.RDeadFish.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);
            } else {
                this.RDeath.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);
            }
        } else if (this.bite) {
            this.REat.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);

        } else {
            this.Ranimation.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);
        }
    } else {
        if (this.bellyUp) {
            if (this.LDeath.isDone()) {
                this.LDeadFish.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);
            } else {
                this.LDeath.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);
            }
        } else if (this.bite) {
                this.LEat.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);
        } else
            this.Lanimation.drawFrame(this.game.clockTick, ctx, this.position.x - 40, this.position.y - 40, 1);
    }

    ctx.strokeStyle = "red";
    ctx.font = "12pt Impact";
    ctx.fillStyle = "red";
    var text = this.getHungerState();
    var x = this.position.x;
    if (this.velocity.x < 0) {
        x -= 45;
    } else {
        x += 40;
    }
    ctx.fillText(text, x, this.position.y - 10);

    if (this.drawCircles) {
        this.boundingCircle.draw(ctx);
        this.vision.draw(ctx);
    }
    Entity.prototype.draw.call(this);
};

Fish.prototype.getHungerState = function() {
    if (this.hungerLevel >= 3) {
        return "full";
    } else if (this.hungerLevel ==2) {
        return "hungry";
    } else if (this.hungerLevel == 1) {
        return "starving";
    }
    return "starved to death";
}
