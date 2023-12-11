const { __esModule } = require('input');

module.exports = {
    _args: () =>{
        return require('minimist')(process.argv.slice(2));
    }
}
