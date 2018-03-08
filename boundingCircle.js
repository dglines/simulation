/**
 * Bounding Circle
 * used specifically for flying monster to detect player and move toward it.
 */
function BoundingCircle(x, y, rad) {
    this.x = x;
    this.y = y;
    this.radius = rad;
    console.log(this.radius);
};

BoundingCircle.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
};

BoundingCircle.prototype.collide = function(other) {
    return distance(this, other) < this.radius + other.radius;
};

BoundingCircle.prototype.leftWall = function() {
    return this.x - this.radius < 0;
}

BoundingCircle.prototype.rightWall = function() {
    return this.x + this.radius > 1600;
}

BoundingCircle.prototype.surface = function() {
    return this.y - this.radius < 0;
}
BoundingCircle.prototype.bottom = function() {
    return this.y + this.radius > 800;
}

BoundingCircle.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "Red";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

    ctx.stroke();
    ctx.closePath();
}

function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};
