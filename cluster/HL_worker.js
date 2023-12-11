const fs = require('fs')
const os = require('os')
const request = require("request")

const DB_1 = "http://localhost:3701"
const DB_2 = "http://localhost:3702"
// request.post(DB_1,
//     {
//         json: {
//             res: fs.readFileSync(path1, 'utf-8'),
//             data: lineMatrix1
//         }
//     },
//     (err, res, body) => {
//         if (err) {
//             return err_handler("net otveta ili soedinenya", 3, err)
//             console.log("DB ERR")
//         }
//         else {
//             return {err: -1, res: res}
//         }
//     }
// );

service = {
    errors: {
        0: {
            type: "system error",
            fatal: true
        },

        1: {
            type: "representaion data error",
            fatal: true
        },

        2: {
            type: "file system error",
            fatal: true
        },
        3: {
            type: "Database problem",
            fatal: true
        }
    }
}

function err_handler(err, type = "0", err_buff = "") {
    return { msg: err, type: type, err_buff: err_buff, id: _id }
}

module.exports = ({ path1, path2, lineMatrix1 }) => {

    try {
        line_1 = fs.readFileSync(path1, 'utf-8').split(os.EOL)[+lineMatrix1].split(" ")
        matrix_2 = fs.readFileSync(path2, 'utf-8').split(os.EOL)
        res = []
        for (let i = 0; i < matrix_2.length; i++) {
            matrix_2[i] = matrix_2[i].split(" ")
            let s = 0
            for (let j = 0; j < matrix_2[i].length; j++) {
                s += (+matrix_2[i][j] * +line_1[j])
            }
            res.push(s)
        }


        request.post(DB_1,
            {
                json: {
                    res: fs.readFileSync(path1, 'utf-8'),
                    data: lineMatrix1
                }
            },
            (err, res, body) => {
                if (err) {
                    return err_handler("net otveta ili soedinenya", 3, err)
                    console.log("DB ERR")
                }
                else {
                    return res
                }
            }
        );


        res = res.join(" ")
        return res

    } catch (err) {
        if (err.code === 'ENOENT') {
            return err_handler("cant find file", 2, err, id = _id)
        }
    }

};
