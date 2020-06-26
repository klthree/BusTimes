// git testing

const got = require('got');
let get_loc = (loc) => {
    return new Promise((resolve, reject) => {
        resolve(loc);
    })
};

let get_routes = (loc) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const busURL = 'http://truetime.portauthority.org/bustime/api/v3/getroutes?key=Tn3GgGfQdbNCmy3HMKix3XLFa&format=json';
                const response = await got(busURL);
                const resp = JSON.parse(response.body);
                const route_list = [];
                const locRegExp = new RegExp(loc, 'i');
    
                resp["bustime-response"].routes.forEach((route) => {
                    if(locRegExp.test(route.rtnm)) {
                        route_list.push(route);
                    }
                });
                
                if(route_list.length > 0) {
                    resolve(route_list);
                } else {
                    reject("Route not found.")
                }
            } catch(error) {
                console.error(error);
            }
        })();
    
    })
}

const get_dir = (route_list) => {
    route_list.forEach((route) => {
        
    })
}

module.exports = {
    get_routes,
    get_dir
}
