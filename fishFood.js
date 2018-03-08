function FishFood(game, x, y) {
    this.game = game;
    this.position = new Vector(x, 5);
    this.sinkRate = new Vector(Math.random() - 0.5, Math.random()/2);
    this.size = (1 + Math.random()) * 3;
    this.boundingCircle = new BoundingCircle(this.position.x, this.position.y, this.size);

    Entity.call(game, this.position.x, this.position.y);
}

FishFood.prototype = new Entity();
FishFood.prototype.constructor = FishFood;

FishFood.prototype.isEaten = function() {
    this.removeFromWorld = true;
}

FishFood.prototype.update = function() {
    this.position.add(this.sinkRate);
    this.boundingCircle.set(this.position.x, this.position.y);
    Entity.prototype.update.call(this);
}

FishFood.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "Brown";
    ctx.arc(this.boundingCircle.x, this.boundingCircle.y, this.boundingCircle.radius, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    Entity.prototype.draw.call(ctx);
}
