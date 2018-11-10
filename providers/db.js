const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const BlockClass = require('../models/Block.js');
const SHA256 = require('crypto-js/sha256');


class LevelDB {
    constructor() {
         this.db = db
        // this.initializeMockData();
     }

    async addLevelDBData(key, value) {
        console.log('addLevelDBData');

        return new Promise((resolve, reject) => {
            this.db.put(key, value, function (err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                console.log('key ', key, ' and value', value, ' has been added successfully');
                resolve(value);
            });
        });
    }

    // addDataToLevelDB(value) {
    //     let i = 0;
    //     return new Promise((resolve, reject) => {
    //         this.db.createReadStream()
    //             .on('error', (err) => {
    //                 console.log('Unable to read data stream!', err);
    //                 resolve(err);
    //             })
    //             .on('data', (data) => {
    //
    //                 i++;
    //             })
    //             .on('close', () => {
    //                 console.log('Block #' + i);
    //                 console.log('Block # value:' + value);
    //                 resolve(this.addLevelDBData(i, value));
    //             })
    //
    //     });
    //
    //
    // }

    getBlocksCount() {
        let i = 0;
        return new Promise((resolve, reject) => {
            db.createReadStream()
                .on('data', function (data) {

                    i++;
                })
                .on('error', function (err) {
                    console.log('Oh my!', err)
                    reject(err);
                })
                .on('close', function () {

                    resolve(i);
                })


        })


    }

    async getBlockByHash(hash){
        let blocks = []
        return new Promise( (resolve, reject) => {
             this.db.createReadStream()
            .on('data',  (data) => {

                data = JSON.parse(data.value)
               
                if(data.hash === hash){ 
                    data.body.star.storyDecoded =  new Buffer(data.body.star.story, 'hex').toString()  
                    resolve(data)  

                }
            })
            .on('error',  (err) => {
                console.log('Oh my!', err)
               
            })
            .on('close',  () => {

                resolve(null) ;
            })
        })
             // return blo/cks


     
}
    async getBlockByWalletAddress(address){
            let blocks = []
            return new Promise( (resolve, reject) => {
                 this.db.createReadStream()
                .on('data',  (data) => {

                    data = JSON.parse(data.value)
                   
                    if(data.body.address === address){ 
                        data.body.star.storyDecoded =  new Buffer(data.body.star.story, 'hex').toString()  
                        blocks.push(data)  
 
                    }
                })
                .on('error',  (err) => {
                    console.log('Oh my!', err)
                   
                })
                .on('close',  () => {
 
                    resolve(blocks) ;
                })
            })
                 // return blo/cks


         
    }
    async getBlock(key) {
        let data
    try{
        data =  await db.get(key)
        data = JSON.parse(data);
        console.log("getBlock",data)
        if(key > 0){
            data.body.star.storyDecoded =  new Buffer(data.body.star.story, 'hex').toString()  

        }

        return  data
    }catch (err){

        if (err.type == 'NotFoundError') {
            console.log('Block ' + key + ' get failed', err);
            throw  `Block ${key} get failed  ${err}`;

         } else {
            console.log('Block ' + key + ' get failed', err);
            throw  `Block ${key} get failed  ${err}`;
        }
    }
         
     }


    getBlockHeight() {
        console.log("getBlockHeight")
        return new Promise((resolve) => {
            this.getBlocksCount().then((count) => {

                count < 1 ? resolve(0) : resolve(count - 1)

            });
        })
    }

    async addBlock(BlockData) {

        // Block height
        let newBlock = {}
        newBlock.body = {
            address : BlockData.address,
            star : BlockData.star,
         }

       
         newBlock.body.star.story = new Buffer(newBlock.body.star.story).toString('hex')
         let GenesisBlock = null;
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        let height = await this.getBlockHeight()
         if (height < 1) {
            console.log("addGenesisBlock")
            try {
                GenesisBlock = await this.addGenesisBlock()
            } catch (err) { 
                console.log("err in addGenesisBlock")

            }
            GenesisBlock = JSON.parse(GenesisBlock)
            newBlock.height = height + 1;
            newBlock.previousBlockHash = GenesisBlock.hash
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            let block = await this.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
            return block


        } else {
            console.log("not GenesisBlock ")
            let block;
            try{

                block = await this.getBlock(height)

             }catch (err){
                console.log("error in adding data to block",err)
                return;
            }
             console.log("block hash",block.hash)

             newBlock.height = height + 1;
            newBlock.previousBlockHash = block.hash
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            newBlock = await this.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
            return newBlock;

        }


    }

    async addGenesisBlock() {
        let block = null
        let genesisBlock = new BlockClass.Block("First block in the chain - Genesis block");
        genesisBlock.time = new Date().getTime().toString().slice(0, -3);

        genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();

        try {
            block = await this.addLevelDBData(genesisBlock.height, JSON.stringify(genesisBlock))

        } catch (err) {
            console.log("err in addGenesisBlock", err);
        }
 
        return block;


    }

    async initializeMockData() {
        let i = 0;


        do {
            console.log("initializeMockData")


            let blockTest = new BlockClass.Block("Test Block - " + (i + 1));

            let result = await  this.addBlock(blockTest)
            console.log("result", result);
            console.log("i", i);
            i++;
        }
        while (i < 5)


    }
}
module.exports = new LevelDB();
