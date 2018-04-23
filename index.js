const Game = require('./js/Game.js');
const debug = require('./js/debug.js');

document.addEventListener('DOMContentLoaded', main, false);

function main() {
    debug.log("DRAW PATH");

    let canvas = document.getElementById("viewCanvas");
    let game = new Game(canvas);
}