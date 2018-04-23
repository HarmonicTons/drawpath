
class Ball {
    constructor(scene, path, frequency, size = 1, color = "red") {
        this.scene = scene;
        this.path = path;

        this.setSpeed(frequency);
        this.radius = size / 10;
        this.color = color;

        this.direction = 1;
        this.distance = 0;
        this.position = path.points[0];

        this.paused = false;
    }

    get speed() {
        let tangent = this.path.getTangent(this.distance);

        return {
            x: tangent.x * this.absoluteSpeed,
            y: tangent.y * this.absoluteSpeed
        }
    }

    setSpeed(frequency) {
        this.absoluteSpeed = frequency * this.path.length;
    }

    getPosition(dt = 0) {
        let distance = dt * this.absoluteSpeed / 1000;
        let resolution = this.path.resolve(this.distance + distance * this.direction);
        distance = resolution.distance;
        let direction = this.direction;
        if (resolution.reversed) {
            direction *= -1;
        }

        let nextPoint = this.path.getCoordinates(distance);

        return {
            position: {
                x: nextPoint.x,
                y: nextPoint.y
            },
            distance: distance,
            direction: direction
        };

    }

    moveToNextPoint(dt) {
        let position = this.getPosition(dt);

        this.direction = position.direction;
        this.distance = position.distance;
        this.position = position.position;
    }

}

module.exports = Ball;
