const Piscina = require('piscina');
const fs = require('fs')
const http = require('http')
const request = require('request');
const { _args } = require("./modules/easy_parse");
const lineByLine = require('n-readlines');
const socket = require('websockets/lib/websockets/socket');


const clusters_options = JSON.parse(fs.readFileSync("./options/clusters.json"))
console.log(clusters_options)


let sh_args = _args()

const PORT = sh_args.PORT || 3500

if (isNaN(+PORT)) {
    throw "bad properties of PORT"
}

let lineStart = 0
let lineNumber = 0;
let clustersWithData = []
let aliveClusters = new Set()
let list_id_name = []
let list_name_id = []

const server = require('http').createServer((req, res) => {
    if (req.method == 'POST') {
        lineNumber = 0;
        clustersWithData = []
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            const data = Buffer.concat(chunks).toString();
            fs.writeFileSync("matrix1.txt", JSON.parse(data).File1)
            fs.writeFileSync("matrix2.txt", JSON.parse(data).File2)
            res.end("data saved, starts calculations")

            lineStart
            const liner = new lineByLine('./matrix2.txt');
            let line;
            while (line = liner.next()) lineNumber++;
            clusters_options.forEach(curr_cluster => {
                if (aliveClusters.has(curr_cluster.name)) {
                    sendMatrixToClusters("matrix1.txt", "matrix2.txt", curr_cluster)
                }
            });

        })
    }
});






function sendMatrixToClusters(path1, path2, curr_cluster) {
    request.post(curr_cluster.hostname + curr_cluster.port,
        {
            json: {
                File1: fs.readFileSync(path1, 'utf-8'),
                File2: fs.readFileSync(path2, 'utf-8')
            }
        },
        (err, res, body) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log("cluster ", curr_cluster.name, " saved info")
                clustersWithData.push([list_name_id[curr_cluster.name], curr_cluster.name])
            }
        }
    );
}





const io = require('socket.io')(server);
io.on('connection', cluster => {
    cluster.once("name", (data) => {
        if (list_name_id[data] == "died") {
            console.log("cluster alive: ", data)
        } else {
            console.log("new cluster connected: ", data)
        }

        aliveClusters.add(data)
        list_name_id[data] = cluster.id
        list_id_name[cluster.id] = data
    })

    cluster.once("disconnect", (data) => {
        if (list_id_name[cluster.id]) {
            aliveClusters.delete(list_id_name[cluster.id])
            console.log("cluster died: ", list_id_name[cluster.id])
            list_name_id[list_id_name[cluster.id]] = "died"
            list_id_name[cluster.id] = undefined
        }
    })

    cluster.on("ready", (num, callback) => {
        
        

        for (let i = lineStart; i < lineStart + Math.floor(lineNumber/aliveClusters.size); i++) {
            if(i < lineNumber){
                cluster.emit("make_HL_it", i)
            } else {
                break;
            }
        }
        lineStart = lineStart + Math.floor(lineNumber/aliveClusters.size)
        if (lineStart >= lineNumber - 1) lineStart = 0
    })

});



server.listen(PORT)

// setInterval(()=>{
//     console.log(list_id_name, list_name_id)
// }, 1000)


// //--servers=2 - два процесса для балансировки
// //PORT=порт балансировщика


// const server = require('http').createServer((req, res) => {
//     res.end("GOOD")
// });

// const io = require('socket.io')(server);
// io.on('connection', server => {

//     server.on('ferret', (name) => {
//         console.log(name, " WOOT")
//     });

//     server.emit("ferret", "e3rgert43t")

// });

// server.listen(PORT);




