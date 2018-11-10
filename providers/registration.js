const BlockClass = require('../models/Block.js');
const SHA256 = require('crypto-js/sha256');
const bitcoinMessage = require('bitcoinjs-message');


class RegistrationProvider {
    constructor() {
         this.activeAddresses = []
        // this.initializeMockData();
     }
     appendAddress(address){
         if(!this.activeAddresses[address]){
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
         } else{
            return this.getRegistrationRequest(this.activeAddresses[address]) 
         }
        
     } 
     getRegistrationRequest(registrationRequest){
         
             let data = { "status": {
                  "address": registrationRequest.address,
                  "requestTimeStamp": registrationRequest.requestTimeStamp,
                  "message": registrationRequest.message,
                  "validationWindow" :     registrationRequest.validationWindow - (new Date().getTime().toString().slice(0,-3) - registrationRequest.requestTimeStamp)  ,
                  "messageSignature": registrationRequest.messageSignature
                }
              }
              return data;
     }

     removeRegistrationRequestByAddress(address){
     

        this.activeAddresses[address] = null;
 
     }
     removeAddress(registrationRequest){
      console.log("removeAddress", registrationRequest)
      console.log("removeAddress2", this.activeAddresses[registrationRequest.address])
    

        this.activeAddresses[registrationRequest.address] = null;
        console.log("removeAddress3", this.activeAddresses[registrationRequest.address])

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
