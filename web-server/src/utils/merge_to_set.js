const duplicate = [
    {
        a:1,
        b:2
    },
    {
        a:3,
        b:4
    }
]

const dup1 = duplicate;

array1 = [
    duplicate,
    duplicate,
    dup1,
    [
        {
            a:1,
            b:6
        },
        {
            a:1,
            b:2
        },
        {
            c: [
                {
                    a:1,
                    b:6
                },
                {
                    a:1,
                    b:2
                }
            ]
        },
        [
            {
                a:1,
                b:6
            },
            {
                a:1,
                b:2
            }
        ]
    ]
]




console.log(array1);
console.log("\n");

function flatDeep(arr, d = 1) {
    return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
                 : arr.slice();
};

const newArray = flatDeep(array1, Infinity);
console.log("After flattening:\n" + JSON.stringify(newArray));

const narr = newArray.reduce((acc, curr) => {
    if(acc.filter((element) => element.a === curr.a).length === 0) {
        acc.push(curr);
    }
    return acc;
}, [])

console.log("And after eliminating dups:\n");
console.log(narr);