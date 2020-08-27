class PriorityQueue {
    
    constructor(...args) {
        this.q = [null];

        for(let i = 0; i < args.length; i++) {
            if(typeof args[i] === 'number') {
                // if(this.distSet) throw "Error: cannot set distance and number of results";
                this.lenSet = true;
                this.size = args[i];
            } else if(typeof args[i] === 'function') {
                // if(this.distSet) throw "Error: cannot set distance and number of results";
                this.compSet = true;
                this.greaterThan = args[i];
            } 
            // else if(typeof args[i] === 'string' && args[i].match(/\d+|\d+\.\d+|\.\d+ [mM]{1}[iI]{1}/)) {
            //     if(lenSet || compSet) throw "Error: cannot set distance and number of results";
            //     this.distance = args[i];
            //     this.distSet = true;
            // }
        }

        if(!this.compSet) {
            this.greaterThan = (a, b) => {
                return a - b > 0;
            }
        }
        if(!this.lenSet) {
            this.size = 5;
        }
    }

    get_q() {
        return this.q;
    }

    insert(value) {
        if(this.lenSet && this.q.length === this.size + 1) {
            if(this.greaterThan(value, this.q[1])) {
                return;
            }
            this.q[1] = value
            this.sink(1);
            return;
        }
        this.q.push(value);
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
        while(2 * k + 1 < this.q.length) {
            let g = this.greater(2 * k, 2 * k + 1);
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

module.exports.PriorityQueue = PriorityQueue;