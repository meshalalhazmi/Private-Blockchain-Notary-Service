# private blockchain generator api

a Star Registry service (based on blockchain) that allows users to claim ownership of their favorite star in the night sky. using node express 

Simple node express web API

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.


### Prerequisites
Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].


### Installing
- Use NPM to install project dependencies.
```
npm install
```
- run  the project with nodemon
```
npm start
```


  

### Endpoint documentation
- URL: http://localhost:8000/requestValidation (POST)
POST method to validates request 
    - parameters:
            address : required

- URL: http://localhost:8000/validate (POST)
POST method to validates signature
    - parameters:
        address : required (must not be null)
        signature : required (must not be null)


- URL: http://localhost:8000/block (POST)
POST method to add a block to the blockchain
    - parameters:
        address : required (must not be null)
        star : required (must not be null) JSON Object { ra: string, dec: string ,story: string (max 500 bytes)}

- URL: http://localhost:8000/stars/hash/{HASH}  (GET)
GET method to get a block by its hash value
    - URL parameters:
        {hash} : required (must not be null)
        
- URL: http://localhost:8000/block/{HEIGHT}  (GET)
GET method to get a block by its hieght
    - URL parameters:
        {hieght} : required (must not be null)
        
- URL: http://localhost:8000/stars/address/{address}  (GET)
GET method to get all blocks by wallet address
    - URL parameters:
        {address} : required (must not be null)
        


 ### dependencies
 - express-validator for input validation
 - level-db for data persistence
 - nodemon for local change detection
 - bitcoinjs-message for block validation