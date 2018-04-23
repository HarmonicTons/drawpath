const debug = require('./debug.js');
const PubSub = require('pubsub-js');

class InputListener {
    /**
     * Listen the input on a DOM element
     * @param {Object} game 
     * @param {Object} elem DOM element
     * @param {string} key key for the events name
     */
    constructor(game, elem, key) {
        this.game = game;
        this.elem = elem;

        window.onkeypress = e => {
            debug.log('Key pressed: ' + e.key);
            if (e.key === 'm') {
                this.game.toggleMonitoring();
            }
            if (e.key === 'r') {
                this.game.toggleTowersRangeDisplay();
            }

            PubSub.publish('onkeypress-' + e.key, e.key);
        }


        window.onkeyup = e => {
            // escape is not detected by on onkeypress event
            if (e.key === 'Escape') {
                PubSub.publish('onkeypress-Escape', 'Escape');
            }
        }

        elem.onclick = (e) => {
            PubSub.publish(key + '-onclick', this.game.gridCoordinates(e.layerX, e.layerY));
        }

        elem.onmousemove = (e) => {
            this.game.setMouseCoordinates(e.layerX, e.layerY);
        }

        elem.onmousedown = (e) => {
            PubSub.publish(key + '-onmousedown', this.game.gridCoordinates(e.layerX, e.layerY));
        }

        elem.onmouseup = (e) => {
            PubSub.publish(key + '-onmouseup', this.game.gridCoordinates(e.layerX, e.layerY));
        }

    }
}

module.exports = InputListener;
