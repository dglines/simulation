
function Vector(x, y){
    this.x = x;
    this.y = y;
}
Vector.prototype.add = function(other){
    this.x += other.x;
    this.y += other.y;
}
Vector.prototype.sub = function(other) {
    this.x -= other.x;
    this.y -= other.y;
}
Vector.prototype.mag = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
}
Vector.prototype.mult = function(num) {
    this.x *= num;
    this.y *= num;
}
Vector.prototype.div = function(num) {
    this.x /= num;
    this.y /= num;
}
Vector.prototype.normalize = function() {
    var m = this.mag();

    if (m > 0) {
        this.div(m);
    }
}
Vector.prototype.limit = function(num) {
    if (this.mag() > num) {
        this.normalize();
        this.mult(num);
    }
}
Vector.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.dist = function(other) {
    var dx = this.x - other.x;
    var dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
}
