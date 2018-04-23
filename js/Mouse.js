class Mouse {
    constructor(game) {
        this.game = game;

        this.screenCoordinates = {
            x: 0,
            y: 0
        }
    }

    /**
     * get gridCoordinates - Grid coordinates of the mouse
     *
     */
    get gridCoordinates() {
        let sc = this.screenCoordinates;
        return this.game.gridCoordinates(sc.x, sc.y);
    }


    /**
     * get gridCoordinates - Grid coordinates of the mouse
     *
     */
    get caseCoordinates() {
        let preciseGridCoordinates = this.gridCoordinates;
        let fx = Math.floor(preciseGridCoordinates.x);
        let fy = Math.floor(preciseGridCoordinates.y);
        return {
            x: fx,
            y: fy
        };
    }
}

module.exports = Mouse;
