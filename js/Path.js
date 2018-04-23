const { distance, max, guid, cacheFunction } = require('./helpers.js');
const cachedDistance = cacheFunction(distance);
const PubSub = require('pubsub-js');

class Path {
    constructor(points, isCicling = false) {
        this.id = guid();
        this._points = points;
        this.isCicling = isCicling;
        this._length = 0;
        this._size = 0;

        PubSub.subscribe(this.id + '-dirty', () => this.onDirty());
        this.onDirty();
    }

    set points(points) {
        this._points = points;
        this.dirt();
    }

    get points() {
        return this._points;
    }

    get length() {
        return this._length;
    }

    get size() {
        return this._size;
    }

    get ratio() {
        return this.size / this.length;
    }

    dirt() {
        PubSub.publish(this.id + '-dirty');
    }

    onDirty() {
        this.resetLength();
        this.resetSize();
    }

    resetLength() {
        let length = 0;
        this.points.forEach((current, index) => {
            if (index === 0) return;
            let prev = this.points[index - 1];
            length += distance(current, prev);
        });
        if (this.isCicling) {
            length += distance(this.points[0], this.points[this.points.length - 1]);
        }
        this._length = length;
    }

    resetSize() {
        let size = 0;
        let distances = [];
        let N = this.points.length;
        for (let i = 0; i < N - 1; i++) {
            for (let j = i + 1; j < N; j++) {
                distances.push(distance(this.points[i], this.points[j]));
            }
        }

        this._size = max(distances);
    }

    addPoint(point) {
        this._points.push(point);
        this.dirt();
    }

    editPoint(index, point) {
        this._points[index] = point;
        this.dirt();
    }

    getPoint(index) {
        if (index < 0 || index > this.points.length) {
            throw new Error(`Index ${index}/${this.points.length} out of bound.`);
        }
        if (index === this.points.length) {
            index = 0;
        }
        if (index === -1) {
            index = this.points.length - 1;
        }
        return this.points[index];
    }

    resolve(d) {
        const L = this.length;
        let reversed = false;

        // do not loop for nothing
        if (d >= 2 * L) {
            d = d % L;
        }

        if (d >= L) {
            if (this.isCicling) {
                d = d - L;
            } else {
                d = 2 * L - d;
                reversed = true;
            }
        }

        if (d < 0) {
            if (this.isCicling) {
                d = L + d;
            } else {
                d = -d;
                reversed = true;
            }
        }

        return {
            distance: d,
            reversed: reversed
        }
    }

    getSegmentPosition(dist) {
        dist = this.resolve(dist).distance;

        let N = this.points.length;
        let index, percent;
        for (index = 0; index <= N - 1; index++) {
            let arcDist = distance(this.getPoint(index), this.getPoint(index + 1));
            if (arcDist >= dist) {
                percent = dist / arcDist;
                dist = 0;
                break;
            }
            dist -= arcDist;
        }

        // in case the remaining distance is still not 0
        if (dist != 0) {
            // the remaining distance should be extremly close to 0 ( < e-15), resolve with:
            index = N - 1;
            percent = 1;
        }

        return {
            index: index,
            percent: percent
        }
    }

    getTangent(dist) {
        let segmentPosition = this.getSegmentPosition(dist);
        let index = segmentPosition.index;
        let percent = segmentPosition.percent;


        if (percent > 0) {
            let p1 = this.getPoint(index);
            let p2 = this.getPoint(index + 1);

            let dy = (p2.y - p1.y);
            let dx = (p2.x - p1.x);
            let L = Math.sqrt(dy ** 2 + dx ** 2);

            return {
                x: dx / L,
                y: dy / L
            }
        } else {
            let p1 = this.getPoint(index - 1);
            let p2 = this.getPoint(index);
            let p3 = this.getPoint(index + 1);

            let dy1 = (p2.y - p1.y);
            let dx1 = (p2.x - p1.x);
            let L1 = Math.sqrt(dy1 ** 2 + dx1 ** 2);

            let dy2 = (p3.y - p2.y);
            let dx2 = (p3.x - p2.x);
            let L2 = Math.sqrt(dy2 ** 2 + dx2 ** 2);

            return {
                x: 1 / 2 * (dx1 / L1 + dx2 / L2),
                y: 1 / 2 * (dy1 / L1 + dy2 / L2)
            }
        }
    }

    getCoordinates(dist) {
        let segmentPosition = this.getSegmentPosition(dist);
        let index = segmentPosition.index;
        let percent = segmentPosition.percent;

        let p1 = this.getPoint(index);
        let p2 = this.getPoint(index + 1);

        return {
            x: p1.x + (p2.x - p1.x) * percent,
            y: p1.y + (p2.y - p1.y) * percent
        }
    }
}

module.exports = Path;
