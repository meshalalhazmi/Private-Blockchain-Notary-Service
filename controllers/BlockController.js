const SHA256 = require('crypto-js/sha256');
const BlockClass = require('../models/Block.js');
const db = require("../providers/db.js");
const registrationProvider = require("../providers/Registration.js");
const { check, validationResult } = require('express-validator/check');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.registrationProvider = registrationProvider
        this.blocks = [];
        this.getBlockByIndex();
        this.postNewBlock();
        this.requestRegistration();
        this.validate();
        this.getBlockByIndex();
        this.getBlockByHash();
        this.getBlockByAddress();
    }

    /**
 * Implement a POST Endpoint to validates signutres , url: "/message-signature/validate"
 */
    validate() {
        this.app.post("/message-signature/validate",
            check('address').exists({ checkNull: true }).withMessage('must exist'),
            check('address').isLength({ min: 1 }).withMessage('must not be empty'),
            check('signature').exists({ checkNull: true }).withMessage('must exist'),
            check('signature').isLength({ min: 1 }).withMessage('must not be empty')
            , (req, res) => {

                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(422).json({ errors: errors.array() });
                }

                res.status(200).json(this.registrationProvider.validateSignature(req.body['address'], req.body['signature']));


            })
    }


    /**
   * Implement a POST Endpoint to validates request , url: "/requestValidation"
   */
    requestRegistration() {
        this.app.post("/requestValidation",
            check('address').exists({ checkNull: true }).withMessage('must exist'),
            check('address').isLength({ min: 1 }).withMessage('must not be empty')
            , (req, res) => {

                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(422).json({ errors: errors.array() });
                }

                res.send(this.registrationProvider.appendAddress(req.body['address']));


            })
    }

    /**
    * configure the blockchain ID validation routine"
    */



    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "stars/address:[ADDRESS]"
     */
    getBlockByAddress() {

        this.app.get("/stars/address/:address", (req, res) => {
            // Add your code here
            (async () => {
                res.setHeader('Content-Type', 'application/json');

                try {
                    console.log("req.params['ADDRESS']", req.params.address)
                    res.send(await db.getBlockByWalletAddress(req.params['address']));
                } catch (error) {
                    res.status(500).send(`Error when retrieving block: ${error}`);

                }

            })()


        });
    }
    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "stars/address:[ADDRESS]"
     */
    getBlockByIndex() {

        this.app.get("/block/:height", (req, res) => {
            // Add your code here
            (async () => {
                res.setHeader('Content-Type', 'application/json');

                try {
                    console.log("req.params['ADDRESS']", req.params.height)
                    res.send(await db.getBlock(req.params['height']));
                } catch (error) {
                    res.status(500).send(`Error when retrieving block: ${error}`);

                }

            })()


        });
    }
 /**
     * Implement a GET Endpoint to retrieve a block by index, url: "stars/hash/:[hash]"
     */
    getBlockByHash() {

        this.app.get("/stars/hash/:hash", (req, res) => {
            // Add your code here
            (async () => {
                res.setHeader('Content-Type', 'application/json');

                try {
                    console.log("req.params['ADDRESS']", req.params.hash)
                    res.send(await db.getBlockByHash(req.params['hash']));
                } catch (error) {
                    res.status(500).send(`Error when retrieving block: ${error}`);

                }

            })()


        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", [
            // body must exist
            check('address').exists({ checkNull: true }).withMessage('must exist'),
            check('address').isLength({ min: 1 }).withMessage('must not be empty'),
            check('star').exists({ checkNull: true }).withMessage('must exist'),
            check('star').isLength({ min: 1 }).withMessage('must not be empty'),
            check('star.ra').exists({ checkNull: true }).withMessage('must exist'),
            check('star.ra').isLength({ min: 1 }).withMessage('must not be empty'),
            check('star.dec').exists({ checkNull: true }).withMessage('must exist'),
            check('star.dec').isLength({ min: 1 }).withMessage('must not be empty'),
            check('star.story').isByteLength({ min: 1, max: 500 }).withMessage('must not be empty and must be less than 500 bytes'),
            check('star.story').isAscii().withMessage('must  be valid ASCII String'),
        ], (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            if(!this.registrationProvider.validationAddress(req.body.address)){
                return res.status(400).json({ errors: "can't register a star, address not found" });

            }
            (async () => {
                res.setHeader('Content-Type', 'application/json');

                res.send(await db.addBlock(req.body));
            })()
        });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */



}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app); }