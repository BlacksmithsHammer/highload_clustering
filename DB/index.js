const http = require('http');
const request = require('request');
const fs = require('fs')

PORT = 3701

http.createServer(function (req, res) {
    if (req.method == "POST") {
        console.log("new")
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            const data = JSON.parse(Buffer.concat(chunks).toString());
            fs.writeFileSync(`${data.data}.txt`, data.res)
            res.end("got")
        })
    }
}).listen(PORT);

