const fs = require("fs")
const os = require("os")

const LENGTH = 20
const HEIGHT = 20
const FILENAME = "matrix2.txt"

// min and max included
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;
    return Math.floor(Math.random() * (max - min)) + min;
}

line = []
fs.writeFileSync(FILENAME, "", "utf8")

for (let h = 0; h < HEIGHT; h++) {
    for (let l = 0; l < LENGTH; l++) {
        line.push(getRandomInt(0, 9))
    }
    fs.appendFileSync(FILENAME, line.join(" "), "utf-8")
    if (h < HEIGHT - 1) {
        fs.appendFileSync(FILENAME, os.EOL, "utf-8")
    }
    line = []
}

