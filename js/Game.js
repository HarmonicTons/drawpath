const debug = require('./debug.js');
const PubSub = require('pubsub-js');
const Mouse = require('./Mouse.js');
const Renderer = require('./Renderer.js');
const Updater = require('./Updater.js');
const Scene = require('./Scene.js');
const InputListener = require('./InputListener.js');
const Timer = require('./Timer.js');

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = new Mouse(this);
        this.renderer = new Renderer(this, canvas);
        this.updater = new Updater(this);
        this.scene = new Scene(this);
        this.inputListener = new InputListener(this, canvas, "map");
        this.renderer.setView(1200, 800);
     
        this.globalTimer = new Timer();


        // start the motor
        this.renderer.render();
        this.updater.update();

        // start the scene
        this.scene.start();
    }

    
    /**
     * setMouseCoordinates - Set mouse position
     *
     * @param  {number} x
     * @param  {number} y
     */
    setMouseCoordinates(x, y) {
        this.mouse.screenCoordinates.x = x;
        this.mouse.screenCoordinates.y = y;
    }


    /**
     * gridCoordinates - Get grid coordinates from screen coordinates
     *
     * @param  {number} x x screen coordinate
     * @param  {number} y x screen coordinate
     * @return {object}   grid coordinates
     */
    gridCoordinates(x, y) {
        return this.renderer.gridCoordinates(x, y);
    }


    /**
     * caseCoordinates - Get case coordinates from screen coordinates
     *
     * @param  {number} x x screen coordinate
     * @param  {number} y x screen coordinate
     * @return {object}   case coordinates
     */
    caseCoordinates(x, y) {
        let gridCoordinates = this.gridCoordinates(x, y);
        return {
            x: Math.floor(gridCoordinates.x),
            y: Math.floor(gridCoordinates.y)
        }
    }

    /**
     * Toggle the monitoring display
     */
    toggleMonitoring() {
        this.renderer.displayMonitoring = !this.renderer.displayMonitoring;
    }

}

module.exports = Game;