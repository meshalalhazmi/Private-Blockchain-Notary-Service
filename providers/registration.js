const BlockClass = require('../models/Block.js');
const SHA256 = require('crypto-js/sha256');
const bitcoinMessage = require('bitcoinjs-message');


class RegistrationProvider {
    constructor() {
         this.activeAddresses = []
        // this.initializeMockData();
     }
     appendAddress(address){
        const timestamp = new Date().getTime().toString().slice(0,-3);;
        const validationWindow = 60 * 5;
         
        const message = `${address}:${timestamp}:starRegistry`
        const registrationRequest = {"address" : address, requestTimeStamp:timestamp, message: message,validationWindow:validationWindow};
        this.activeAddresses[address] = registrationRequest
        setTimeout( () => {  
              console.log("registrationRequest",registrationRequest);
              this.removeAddress(registrationRequest)
        }, validationWindow * 1000); 
        
        return registrationRequest
     } 
     removeAddress(registrationRequest){
        this.activeAddresses[registrationRequest.address] = null;
     }

     validationAddress(address){
        return  this.activeAddresses[address]
        
     }
     validateSignature(address,signature){
        let registrationRequest =  this.activeAddresses[address]
         if(!registrationRequest){
            return {
            "registerStar": false,
            "status": "address not found"
             }
        }
        if(bitcoinMessage.verify(registrationRequest.message,address,signature)){
            return {
                "registerStar": true,
                "status": {
                  "address": registrationRequest.address,
                  "requestTimeStamp": registrationRequest.requestTimeStamp,
                  "message": registrationRequest.message,
                  "validationWindow" :     registrationRequest.validationWindow - (new Date().getTime().toString().slice(0,-3) - registrationRequest.requestTimeStamp)  ,
                  "messageSignature": "valid"
                }
              }
        }else{
            return {
                "registerStar": false,
                "status": {
                  "address": registrationRequest.address,
                  "requestTimeStamp": registrationRequest.requestTimeStamp,
                  "message": registrationRequest.message,
                  "validationWindow":     registrationRequest.validationWindow - (new Date().getTime().toString().slice(0,-3) - registrationRequest.requestTimeStamp)  ,
                  "messageSignature": "invalid"
                }
              }
        }
     }
    }
module.exports = new RegistrationProvider();
