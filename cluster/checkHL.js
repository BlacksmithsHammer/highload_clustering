const fs = require('fs')

line_1 = fs.readFileSync("matrix1.txt", 'utf-8')
line_2 = fs.readFileSync("matrix2.txt", 'utf-8')


function err_handler(err, type = "0", err_buff = "") {
    return {msg: err, type: type, err_buff: err_buff}
}

s = 0


for (let i = 0; i < line_1.length; i++) {
    if (isNaN(+line_1[i]) || isNaN(+line_2[i])) {
        return err_handler("non number data", 1)
    } else {
        s += +line_1[i] + +line_2[i]
    }
}
console.log(1)