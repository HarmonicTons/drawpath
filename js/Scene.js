const debug = require('./debug.js');
const Action = require('./Action.js');
const InputListener = require('./InputListener.js');
const distance = require('./helpers.js').distance;
const Path = require('./Path.js');
const Ball = require('./Ball.js');
const Timer = require('./Timer.js');

class Scene {
    constructor(game) {
        this.game = game;
        this._statusNames = [];
        this.statusIndex = 0;
        this.actions = [];

        this._isDrawing = false;
        this.currentPath;


        this.ratioMin = 0.2;
        this.lengthMin = 5;

        this.balls = [];

        this.timer = new Timer();

        this.setActions();
    }

    get frequency() {
        return (this.balls.length / 2 + 1) / 5;
    }

    get period() {
        return 1000 / this.frequency;
    }

    get status() {
        return this._statusNames[this.statusIndex];
    }


    /**
     * start - Start the scene with it's scenaro
     *
     */
    start() {

    }


    /**
     * update - Update the scene
     *
     */
    update(dt) {
        // move the balls
        this.balls.forEach(ball => {
            ball.moveToNextPoint(dt);
        })


        if (this._isDrawing) {
            this.updateDrawing();
        }

        this.impact()
    }

    /**
     * 
     */
    impact() {
        let balls = this.balls;
        for (let i = 0; i < balls.length - 1; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                let b1 = balls[i];
                let b2 = balls[j];
                if (distance(b1.position, b2.position) <= b1.radius + b2.radius) {
                    // destroy
                    balls.splice(j, 1);
                    balls.splice(i, 1);
                    // adapt to the index changes
                    i--;
                    break;
                }
            }
        }
    }

    /**
     * 
     */
    updateDrawing() {
        let lastPoint = this.currentPath.points[this.currentPath.points.length - 1];
        let currentPoint = this.game.mouse.gridCoordinates;
        // if the mouse coordinates changed
        if (!lastPoint || lastPoint.x !== currentPoint.x || lastPoint.y !== currentPoint.y) {
            let beforeLastPoint = this.currentPath.points[this.currentPath.points.length - 2];
            // if the before-last point is not far enough
            if (beforeLastPoint && distance(beforeLastPoint, currentPoint) < 0.5) {
                // change le last point coordinates
                this.currentPath.editPoint(this.currentPath.points.length - 1, currentPoint);
            }
            else {
                // register a new point
                this.currentPath.addPoint(currentPoint);
            }

            this.closePath();
        }
    }

    /**
     * 
     */
    closePath() {
        if (this.currentPath.points.length <= 2) return;

        let firstPoint = this.currentPath.points[0];
        let lastPoint = this.currentPath.points[this.currentPath.points.length - 1];
        // if the 1st and last point are close enough the path is cicling
        if (distance(firstPoint, lastPoint) < 0.5) {
            this.currentPath.isCicling = true;
        } else {
            this.currentPath.isCicling = false;
        }
    }


    /**
     * resetActions - Turn off the current set of available actions
     *
     */
    resetActions() {
        this.actions.forEach(action => {
            action.deactivate();
        })
    }

    startDrawing() {
        this._isDrawing = true;
        this.currentPath = new Path([]);
    }

    endDrawing() {
        this._isDrawing = false;

        if (this.currentPath.points.length >= 2) {
            let lengthMin = this.currentPath.isCicling ? this.lengthMin : this.lengthMin / 2;
            if (this.currentPath.length < lengthMin || this.currentPath.ratio < this.ratioMin) {
                return console.log(`Path not valid`)
            }
            let size = (this.balls.length / 5 + 1);
            let color;
            if (this.balls.length % 2) {
                color = "red"
            } else {
                color = "blue";
            }
            let ball = new Ball(this, this.currentPath, this.frequency, size, color);
            this.balls.push(ball);

            this.balls.forEach(ball => ball.setSpeed(this.frequency));
        }
    }


    /**
     * setActions - Set the default set of actions
     */
    setActions() {
        this.resetActions();
        this.addAction('onclick', function (eventName, data) {
            //debug.log(`Click x:${data.x}, y:${data.y}`);
        }, ['map-onclick']);

        this.addAction('onmousedown', function (eventName, data) {
            if (!this._isDrawing) {
                this.startDrawing()
            }
        }, ['map-onmousedown']);

        this.addAction('onmouseup', function (eventName, data) {
            if (this._isDrawing) {
                this.endDrawing();
            }
        }, ['map-onmouseup']);
    }


    /**
     * addAction - Add an action
     *
     * @param  {string} name        Action's name
     * @param  {function} operation Action's operation
     * @param  {string[]} triggers  Action's triggers
     * @return {Action}             Action added
     */
    addAction(name, operation, triggers) {
        let action = new Action(this, name, operation, triggers);
        this.actions.push(action);
        return action;
    }


    /**
     * removeAction - Remove an action if it exists currently
     *
     * @param  {string} name Name of the action to remove       
     */
    removeAction(name) {
        let actionsToRemove = this.actions.filter(a => a.name === name);
        actionsToRemove.forEach(a => {
            a.deactivate();
            this.actions.splice(this.actions.indexOf(a));
        });
    }
}

module.exports = Scene;
