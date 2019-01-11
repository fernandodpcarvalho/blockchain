/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        let self = this;
        self.db = level(chainDB);
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            console.log('Adding Block #' + key);
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                }else {
                    resolve(value);
                }
            });
        });
    }

    // Method that return the height
    getHeight() {
        let self = this;
        let height = 0;
        return new Promise(function(resolve, reject){
            self.db.createReadStream()
                .on('data', function (data) {
                    height++;
                })
                .on('error', function (err) {
                    console.log('Oh my!', err);
                    reject(err);
                })
                .on('close', function () {
                    resolve(height - 1);
                })
            });
    }
}

module.exports.LevelSandbox = LevelSandbox;
