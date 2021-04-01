/*
    Returns an array of the lowest n items in a stream or collection of data, where n
    is either supplied by the user or defaults to 5.
    Implementation adapted from 
*/

class PriorityQueue {
    /**
     * Constructor for instance of pq.js.
     * 
     * @param  {...(number|function)} args [number size=5] [function greaterThan=(a, b) => return a - b > 0]
     */
    constructor(...args) {
        this.q = [];
        this.lenSet = false;
        this.size = 0;
        this.compareFuncSet = false;
        this.greaterThan = null;

        for(let i = 0; i < args.length; i++) {
            if(typeof args[i] === 'number') {
                this.lenSet = true;
                this.size = args[i];
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
            if(this.greaterThan(value, this.q[0])) {
                return;
            }

            this.q[0] = value
            this.sink(0);

            return;
        }

        this.q.push(value);
        this.swim(this.q.length - 1);
    }

    delMax() {
        this.exch(0, this.q.length - 1);
        let max = this.q.splice(this.q.length - 1);
        this.sink(0);
        return max;
    }

    exch(a, b) {
        let tmp = this.q[a];
        this.q[a] = this.q[b];
        this.q[b] = tmp;
    }

    swim(k) {
        while(k > 0 && this.greaterThan(this.q[k], this.q[Math.floor(k/2)])) {
            console.log("Swimming " + this.q[k]);
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
// console.log(testData);
// // let testData = [
// //     250, 302, 406, 112, 271, 267,  30,
// //      90, 450, 282, 313, 416, 248, 318,
// //     271, 412, 275, 261,  35, 396, 271,
// //     298,  99, 498, 123, 214, 294, 306,
// //     388, 282
// //   ]
// let pq = new PriorityQueue();

// for (let i = 0; i < testData.length; i++) {
//     // console.log("Inserting " + testData[i]);
//     // console.log(pq.get_q());
//     pq.insert(testData[i]);
//     // console.log(pq.get_q());
//     // console.log();
// }
// console.log(pq);

module.exports.PriorityQueue = PriorityQueue;