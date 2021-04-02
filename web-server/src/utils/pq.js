/*
    Returns an array of the lowest n items in a stream or collection of data, where n
    is either supplied by the user or defaults to 5.
    Implementation adapted from 
*/
// const distance = require('./helpers.js').euclideanDistance;

class PriorityQueue {
    /**
     * Constructor for instance of pq.js.
     * 
     * @param  {...(number|function)} args [number size=5] [function greaterThan=(a, b) => return a - b > 0]
     */
    constructor(...args) {
        this.q = [null];
        this.lenSet = false;
        this.size = 0;
        this.compareFuncSet = false;
        this.greaterThan = null;
        this.start = null;

        for(let i = 0; i < args.length; i++) {
            if(typeof args[i] === 'number') {
                this.lenSet = true;
                this.size = args[i] + 1;
            } else if(typeof args[i] === 'function') {
                this.compareFuncSet = true;
                this.greaterThan = args[i];
            }
        }

        if(!this.compareFuncSet) {
            this.greaterThan = (a, b) => {
                return a - b > 0;
            }
            this.compareFuncSet = true;
        }
        if(!this.lenSet) {
            this.size = 5;
            this.lenSet = true;
        }
    }

    get_q() {
        return this.q;
    }

    insert(value) {
        if(this.q.length === this.size) {
            if(this.greaterThan(value, this.q[1])) {
                return;
            }
            // console.log("Inserting " + value)
            // console.log("Current state:");
            // console.log(this.get_q());

            // console.log("Distance between " + this.q[1] + " and " + this.start + ":");
            // console.log(distance({lat: this.q[1].split(/(?<!\".*),(?!.*\")/)[4], lon: this.q[1].split(/(?<!\".*),(?!.*\")/)[5]}, this.start));
            // console.log("Distance between " + value + " and " + this.start + ":");
            // console.log(value + " is at " + value.split(/(?<!\".*),(?!.*\")/)[4] + ", " + value.split(/(?<!\".*),(?!.*\")/)[5]);
            // console.log(distance({lat: value.split(/(?<!\".*),(?!.*\")/)[4], lon: value.split(/(?<!\".*),(?!.*\")/)[5]}, this.start));
            this.q[1] = value
            this.sink(1);

            return;
        }

        this.q.push(value);
        // Debugging console
        // console.log(this.q);
        this.swim(this.q.length - 1);
    }

    delMax() {
        this.exch(1, this.q.length - 1);
        let max = this.q.splice(this.q.length - 1);
        this.sink(1);
        return max;
    }

    exch(a, b) {
        let tmp = this.q[a];
        this.q[a] = this.q[b];
        this.q[b] = tmp;
    }

    swim(k) {
        while(k > 1 && this.greaterThan(this.q[k], this.q[Math.floor(k/2)])) {
            this.exch(k, Math.floor(k/2));
            k = Math.floor(k/2);
        }
    }

    sink(k) {
        let g = 0;
        while(2 * k < this.q.length) {
            if (2 * k + 1 >= this.q.length) {
                g = 2 * k;
            } else {
                g = this.greater(2 * k, 2 * k + 1);
            }

            if(this.greaterThan(this.q[g], this.q[k])) {
                this.exch(k, g);
            } else {
                break;
            }

            k = g;
        }
    }

    greater(a, b) {
        if(this.greaterThan(this.q[a], this.q[b])) {
            return a;
        }
        return b;
    }
}

// Test
// let testDataSize = 30;
// let max = 500;
// let testData = [];

// const generateData = (size) => {
//     for (let i = 0; i < size; i++) {
//         testData.push(Math.floor(Math.random() * max));
//     }
// }

// generateData(testDataSize);

// testData = [
//     250, 302, 406, 112, 271, 267,  30,
//      90, 450, 282, 313, 416, 248, 318,
//     271, 412, 275, 261,  35, 396, 271,
//     298,  99, 498, 123, 214, 294, 306,
//     388, 282
//   ]
// console.log(testData);
// let pq = new PriorityQueue();

// for (let i = 0; i < testData.length; i++) {
//     pq.insert(testData[i]);
// }
// console.log(pq);

module.exports.PriorityQueue = PriorityQueue;