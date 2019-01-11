/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
const SHA256 = require("crypto-js/sha256");
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');
const rimraf = require("rimraf");

class Blockchain {

    constructor() {
        this.cleanDatabase().then(ok => {
            console.log(ok);
            this.bd = new LevelSandbox.LevelSandbox();
            this.generateGenesisBlock();
        });       
    }
    
    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        let self = this;
        self.addBlock(new Block.Block("First block in the chain - Genesis block"));
    }

    // Add new block
    async addBlock(newBlock) {
        let self = this;
        let blockchainHeight = await self.getBlockchainHeigthAsync();
        newBlock.height = blockchainHeight + 1;
        if(blockchainHeight >= 0) {
            let previousBlock = await self.getBlockAsync(blockchainHeight);
            newBlock.previusblockhash = JSON.parse(previousBlock).hash;
        }
        newBlock.time = self.getNewBlockTime();
        newBlock.hash = self.getBlockHash(newBlock);

        console.log('Block #'+newBlock.height+': '+JSON.stringify(newBlock));
        
        await self.addLevelDBDataAsync(newBlock);
    }
    
    // Get block height, it is a helper method that return the height of the blockchain
    getBlockchainHeigthAsync() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.getHeight().then(height => {
                resolve(height);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

    // Get Block By Height
    getBlockAsync(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.getLevelDBData(height).then(block => {
               resolve(block);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

    // Get block Time
    getNewBlockTime() {
        return new Date().getTime().toString().slice(0,-3);
    }

    // Get new Block hash
    getBlockHash(newBlock) {
        return SHA256(JSON.stringify(newBlock)).toString();
    }    

    addLevelDBDataAsync(newBlock) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.addLevelDBData(newBlock.height, JSON.stringify(newBlock)).then(block => {
                let blockAdded = JSON.parse(block);
                console.log('Block #' +blockAdded.height+ ' added successfully!');
                resolve(blockAdded);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

    // Validate if Block is being tablockHashight
    async validateBlock(height) {
        let self = this;
        let blockString = await self.getBlockAsync(height);
        let block = JSON.parse(blockString);
        let blockHash = block.hash;
        block.hash = '';
        let validBlockHash =  self.getBlockHash(block);
        return blockHash === validBlockHash;
    }

    // Validate Blockchain
    async validateChain() {
        let self = this;
        let blockchainHeight = await self.getBlockchainHeigthAsync();
        let errorLog = [];
        for(let height=0;height<blockchainHeight;height++) {
            let isvalid = self.validateBlock(height);
            if(!isvalid) {
                errorLog.push(i);
            }
        }
        if (errorLog.length>0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: '+errorLog);
        } else {
        console.log('No errors detected');
        }
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise((resolve, reject) => {
             self.db.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

    cleanDatabase() {
        return new Promise((resolve, reject) => {
            rimraf('./chaindata/', function (e) { 
                if(e){
                    console.log(e); 
                    reject(e);
                } 
                else {
                    resolve('Database cleaned successfully')
                }
            })
       });
    }
}

module.exports.Blockchain = Blockchain;
