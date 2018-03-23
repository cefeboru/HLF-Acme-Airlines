# HLF-Acme-Airlines
A simple test application using Hyperledger composer.

# Context
Acme airlines have been having troubles with their scheduling system, a lot of people has lost flights because of the databases of different airports not being in sync. Acme hired us to build a blockchain application so that they can have a more robust application and real time data across all the airports.

# Assets
We define an assets as an object that represents value to the organization and that it can be digitally represented.

What are the assets of Acme Airlines: 
### Aircraft 
* ownershipType
* number of seats  
### Flight  
* flightNumber
* origin
* destination
* scheduledTime

# Transactions | Smart Contracts | Chaincode
A transaction is any change to an assets status, including the creation and removal of assets. Transactions are defined in the model (`.cto` files) and the logic is defined in the `lib/logic.js` file. Logic is associated using anotations, example:  
```javascript
/**
 * @param {org.acme.airlines.flight.CreateFlight} flightData
 * @transaction
 */
function CreateFlight(flightData) {...}
```  

What transactions Acme Airlines wants to handle?:
### Schedule/Create new flight
Acme Airlines want to be able to create new flights, as well they want all the airports operators to know when new flights are created, this is achievable using `Èvents`.


