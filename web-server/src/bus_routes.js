// git master

const got = require('got');

// testing git line

get_routes = (loc, callback) => {
    (async () => {
        try {
            const busURL = 'http://truetime.portauthority.org/bustime/api/v3/getroutes?key=Tn3GgGfQdbNCmy3HMKix3XLFa&format=json';
            const response = await got(busURL);
            // const route_list = await process_routes(response);    
            const resp = JSON.parse(response.body);
            const route_list = [];
            const locRegExp = new RegExp(loc, 'i');

            resp["bustime-response"].routes.forEach((route) => {
                if(locRegExp.test(route.rtnm)) {
                    route_list.push(route);
                }
            });

            callback(route_list);

            // if(route_list.length > 0) {
            //     const final_list = await get_dir(route_list);
            //     callback(final_list);
            // } else {
            //     callback("Route not found");
            // }
        } catch(error) {
            console.error(error);
        }
    })();
}

get_dir = (route_list) => {
        console.log(route_list);
            try {
            let dirURL;
            route_list.forEach(async (route) => {
                dirURL = 'http://truetime.portauthority.org/bustime/api/v3/getdirections?key=Tn3GgGfQdbNCmy3HMKix3XLFa&rt='
                    + route.rt + '&format=json&rtpidatafeed=' + route.rtpidatafeed;
                const response = await got(dirURL);
                const resp = JSON.parse(response.body);
                // console.log(resp["bustime-response"].directions[0]);
                console.log(route);
                route.dir = "hello";
                console.log(route_list);
            })
            console.log("Route list:");
            console.log(route_list);
            return new Promise((resolve, reject) => resolve(route_list));

            } catch(error) {
                console.error(error);
            }
};

process_routes = (route_response) => {
    const resp = JSON.parse(route_response.body);
    const locRegExp = new RegExp(loc, 'i');
    let route_list = [];
    
    resp["bustime-response"].routes.forEach((route) => {
        if(locRegExp.test(route.rtnm)) {
            route_list.push({
                rt: route.rt,
                route_name: route.rtdd + " - " + route.rtnm
            });
        }
    });
    return new Promise((resolve, reject) => {
        resolve(route_list);
    })
}
module.exports = {
    get_routes,
    get_dir
}
