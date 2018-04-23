const debug = require('./debug.js');
const Timer = require('./Timer.js');
const View = require('./View.js');

class Renderer {
    constructor(game, canvas) {
        this.game = game;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        // disallow image smoothing
        this.context.imageSmoothingEnabled = false;

        this.view = new View(this, canvas);

        this.displayMonitoring = true;

        this.timer = new Timer();
        this.frames = 0;
        this.fps = 0;

        this.lastFramesDuration = [];
        this.stoped = false;

        this.ghosts = {
            number: 10,
            dt: 50
        }
    }


    /**
     * stop - Stop the renderer
     *
     */
    stop() {
        debug.log("Stoping render.");
        this.stoped = true;
    }

    /**
     * Render the current frame
     */
    render() {
        if (this.stoped) return;
        this.frames++;
        let dt = this.timer.reset();
        if (this.frames % 100 === 0) {
            let avg_dt = this.lastFramesDuration.reduce((s, dt) => s + dt, 0) / this.lastFramesDuration.length;
            this.fps = 1000 / avg_dt;
            this.lastFramesDuration = [];
        } else {
            this.lastFramesDuration.push(dt);
        }

        // clear canvas
        this.context.clearRect(0, 0, this.view.width, this.view.height);

        this.drawBackground();
        this.drawPath();
        this.drawBalls();

        // draw monitoring
        if (this.displayMonitoring) {
            this.drawMonitoring();
        }

        // draw next frame
        requestAnimationFrame(() => {
            this.render();
        });
    }

    drawBackground() {
        let scene = this.game.scene;

        let t = scene.timer.now % scene.period;
        let blue = Math.floor(255 * Math.exp(- t / scene.period * 100));
        
        this.context.fillStyle = `rgb(${255-blue},${255-blue},${blue})`;

        this.context.fillStyle = `rgb(240,240,255)`;
        this.context.fillRect(0, 0, this.view.width, this.view.height);
    }

    /**
     * Draw monitoring data
     */
    drawMonitoring() {
        this.context.font = "10px Arial";
        this.context.fillStyle = "black";
        this.context.fillText("Time : " + this.game.globalTimer.timeString, this.view.width - 100, 20, 100);
        this.context.fillText("FPS : " + this.fps.toFixed(1), this.view.width - 100, 30, 100);
        this.context.fillText("UPS : " + this.game.updater.ups.toFixed(1), this.view.width - 100, 40, 100);
        this.context.fillText("Mouse : " + this.game.mouse.gridCoordinates.x.toFixed(2) + "," + this.game.mouse.gridCoordinates.y.toFixed(2), this.view.width - 100, 50, 100);
    }

    /**
     * 
     */
    drawBalls() {
        let balls = this.game.scene.balls;

        balls.forEach(ball => {
            let ghostBalls = [];
            for (let i = 1; i <= this.ghosts.number; i++) {
                let dt = - i * this.ghosts.dt;
                ghostBalls.push(ball.getPosition(dt));
            }
            ghostBalls.forEach((ghostBall, i) => {
                ghostBall.color = ball.color;
                ghostBall.radius = ball.radius / (i + 2) * 1.5;
                this.drawBall(ghostBall, 1 / (2 * i + 1));
            });
            this.drawBall(ball)
        });
    }

    /**
     * 
     * @param {Ball} ball 
     */
    drawBall(ball, opacity = 1) {
        this.context.fillStyle = ball.color;
        this.context.globalAlpha = opacity;
        let sc = this.screenCoordinates(ball.position.x, ball.position.y);


        // let speed = ball.speed;
        // this.context.beginPath();
        // this.context.moveTo(sc.x, sc.y);
        // this.context.lineTo(sc.x + speed.x * ball.direction, sc.y + speed.y * ball.direction);
        // this.context.lineWidth = 2;
        // this.context.strokeStyle = "red";
        // this.context.stroke();


        let r = ball.radius * this.view.tileSize;
        this.context.beginPath();
        this.context.ellipse(sc.x, sc.y, r, r, 0, 0, 2 * Math.PI);
        this.context.fill();
    }

    /**
     * 
     */
    drawPath() {
        let path = this.game.scene.currentPath;
        if (!path) return;

        this.context.beginPath();
        path.points.forEach((current, index) => {
            let sc = this.screenCoordinates(current.x, current.y);
            if (index === 0) {
                this.context.moveTo(sc.x, sc.y);
                return;
            }
            this.context.lineTo(sc.x, sc.y);
        });
        if (path.isCicling) {
            this.context.closePath();
        }
        this.context.lineWidth = 16;
        this.context.strokeStyle = "#ccccff";
        this.context.stroke();


        // this.context.fillStyle = "grey";
        // let p, sc;
        // p = path.getCoordinates(0);
        // sc = this.screenCoordinates(p.x, p.y);
        // this.context.beginPath();
        // this.context.ellipse(sc.x, sc.y, 10, 10, 0, 0, 2 * Math.PI);
        // this.context.fill();
        // p = path.getCoordinates(path.length / 4);
        // sc = this.screenCoordinates(p.x, p.y);
        // this.context.beginPath();
        // this.context.ellipse(sc.x, sc.y, 10, 10, 0, 0, 2 * Math.PI);
        // this.context.fill();
        // p = path.getCoordinates(path.length / 2);
        // sc = this.screenCoordinates(p.x, p.y);
        // this.context.beginPath();
        // this.context.ellipse(sc.x, sc.y, 10, 10, 0, 0, 2 * Math.PI);
        // this.context.fill();
        // p = path.getCoordinates(3*path.length / 4);
        // sc = this.screenCoordinates(p.x, p.y);
        // this.context.beginPath();
        // this.context.ellipse(sc.x, sc.y, 10, 10, 0, 0, 2 * Math.PI);
        // this.context.fill();
    }

    /**
     * Set a new view
     * @param {number} width
     * @param {number} height
     */
    setView(width, height) {
        this.view.width = width;
        this.view.height = height;
    }


    /**
     * Load several images
     *
     * @param {string[]} imagesPaths files paths
     * @return {Promise} promise of the images
     */
    loadImages(imagesPaths) {
        return Promise.all(imagesPaths.map(this.loadImage));
    }

    /**
     * Load an image from its file path
     *
     * @param {string} imagePath file path
     * @return {Promise} promise of the image
     */
    loadImage(imagePath) {
        debug.log(`Loading ${imagePath}...`);
        let img = new Image();
        img.src = imagePath;

        return new Promise(function (resolve, reject) {
            img.onload = function () {
                debug.log(`${imagePath} loaded.`);
                resolve(img);
            };
            img.onerror = function () {
                debug.warn(`${imagePath} not found.`);
                resolve();
            }
        });
    }

    gridCoordinates(x, y) {
        return this.view.gridCoordinates(x, y);
    }

    screenCoordinates(x, y) {
        return this.view.screenCoordinates(x, y);
    }
}

module.exports = Renderer;
