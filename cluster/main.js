const path = require('path');
const Piscina = require('piscina');
const http = require('http')
const fs = require("fs")
const request = require("request")
const socket_client = require('socket.io-client')
const { _args } = require("./modules/easy_parse");
const { error } = require('console');

let sh_args = _args()
const DB_1 = "http://localhost:3701"
const DB_2 = "http://localhost:3702"
const HIGH_LOAD_THREADS = sh_args.HLTHREADS || 4
const LOW_LOAD_THREADS = sh_args.LLTHREADS || 1
const BALANCER_PORT = sh_args.BALPORT || 3500
const BALANCER_HOSTNAME = sh_args.BALHOST || "http://localhost:"
const CLUSTER_NAME = sh_args.NAME || "cluster_1"
const CLUSTER_PORT = sh_args.PORT || "3501"


if (HIGH_LOAD_THREADS < 1 || LOW_LOAD_THREADS < 1 || typeof LOW_LOAD_THREADS != 'number' || typeof HIGH_LOAD_THREADS != 'number') {
    throw "bad properties"
}

tasks = 0

const HL_worker = new Piscina({
    filename: path.resolve(__dirname, 'HL_worker.js'),
    minThreads: 1,
    maxThreads: HIGH_LOAD_THREADS
});

const LL_worker = new Piscina({
    filename: path.resolve(__dirname, 'LL_worker.js'),
    minThreads: 1,
    maxThreads: LOW_LOAD_THREADS
});




const balancer = socket_client.connect(BALANCER_HOSTNAME + BALANCER_PORT, {
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax': 2000,
    'reconnectionAttempts': 60
});

balancer.on("connect", function () {
    console.log('Cinnected to balancer on: ', BALANCER_HOSTNAME + BALANCER_PORT);
    balancer.emit("name", CLUSTER_NAME);

});

balancer.on("disconnect", () => {
    console.log("BALANCER DIED AAAAAAAAAAAAAAAAA")
})

balancer.on("make_HL_it", (data) => {
    (async function() {
        const result = await HL_worker.run({path1: "matrix1.txt", path2: "matrix1.txt", lineMatrix1:data });
        

        request.post(DB_1,
            {
                json: {
                    res: result,
                    data: data
                }
            },
            (err, res, body) => {
                if (err) {
                    console.log(err_handler("net otveta ili soedinenya", 3, err))
                }
                else {
                    console.log("transported in DB")
                }
            }
        );



    })();
})








// function newHLTask(path1, path2, lineMatrix1) {
//     (async function () {
//         tasks += 1
//         result = await HL_worker.run({ path1, path2, lineMatrix1})
//         console.log(result, " mda", lineMatrix1)
//         tasks -= 1
//     })();
// }








const server = http.createServer((req, res) => {
    if (req.method == 'POST') {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            const data = Buffer.concat(chunks).toString();
            fs.writeFileSync("matrix1.txt", JSON.parse(data).File1)
            fs.writeFileSync("matrix2.txt", JSON.parse(data).File2)
            res.end("got")
            balancer.emit("ready", HIGH_LOAD_THREADS-tasks)
        })
    } 
});



server.listen(CLUSTER_PORT)














//newHLTask(__dirname)

// tasksNow = 0


// i = 0
// while (i < 6) {
//     (async function () {
//         tasksNow++
//         const result = await piscina.run({ a: 4, b: 6 });
//         tasksNow--
//         console.log(tasksNow);  // Prints 10
//     })();
//     i++
// }


