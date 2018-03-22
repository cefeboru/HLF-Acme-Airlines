'use strict';
/**
 * Write the unit tests for your transction processor functions here
 */

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const IdCard = require('composer-common').IdCard;
const MemoryCardStore = require('composer-common').MemoryCardStore;

const path = require('path');

require('chai').should();

const namespaces = {
    'aircraft': 'org.acme.airlines.aircraft',
    'flight': 'org.acme.airlines.flight',
    'participant': 'org.acme.airlines.participant'
};

describe('#org.acme.airlines', () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = new MemoryCardStore();
    let adminConnection;
    let businessNetworkConnection;
    let businessNetworkDefinition;

    before(() => {
        // Embedded connection used for local testing
        const connectionProfile = {
            name: 'embedded',
            type: 'embedded'
        };
        // Embedded connection does not need real credentials
        const credentials = {
            certificate: 'FAKE CERTIFICATE',
            privateKey: 'FAKE PRIVATE KEY'
        };

        // PeerAdmin identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);

        const deployerCardName = 'PeerAdmin';
        adminConnection = new AdminConnection({ cardStore: cardStore });

        return adminConnection.importCard(deployerCardName, deployerCard).then(() => {
            return adminConnection.connect(deployerCardName);
        });
    });

    beforeEach(() => {
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });

        const adminUserName = 'admin';
        let adminCardName;

        return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..')).then(definition => {
            businessNetworkDefinition = definition;
            // Install the Composer runtime for the new business network
            return adminConnection.install(businessNetworkDefinition.getName());
        }).then(() => {
            // Start the business network and configure an network admin identity
            const startOptions = {
                networkAdmins: [
                    {
                        userName: adminUserName,
                        enrollmentSecret: 'adminpw'
                    }
                ]
            };
            return adminConnection.start(businessNetworkDefinition, startOptions);
        }).then(adminCards => {
            // Import the network admin identity for us to use
            adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`;
            return adminConnection.importCard(adminCardName, adminCards.get(adminUserName));
        }).then(() => {
            // Connect to the business network using the network admin identity
            return businessNetworkConnection.connect(adminCardName);
        }).then(result => {
            businessNetworkDefinition = result;
        });
    });

    describe('CreateFlight()', () => {
        it('should create a flight and trigger the event', () => {
            const factory = businessNetworkDefinition.getFactory();
            const aircraft = factory.newResource(namespaces.aircraft, 'Aircraft', 'AIRCRFT_001');
            aircraft.ownershipType = 'OWNED';
            aircraft.firstClassSeats = 20;
            aircraft.businessClassSeats = 30;
            aircraft.economyClassSeats = 40;
            //Create transaction
            let serializer = businessNetworkDefinition.getSerializer();
            let createFligthTx = serializer.fromJSON({
                $class: 'org.acme.airlines.flight.CreateFlight',
                flightNumber: 'FL0110',
                origin: 'SPS',
                destination: 'MLF',
                schedule: new Date()
            });

            let aircraftRegistry;
            return businessNetworkConnection.getAssetRegistry(namespaces.aircraft + '.' + 'Aircraft')
                .then(registry => {
                    aircraftRegistry = registry;
                    // Add the asset to the appropriate asset registry
                    return registry.add(aircraft);
                }).then(() => {
                    // Submit the transaction
                    businessNetworkConnection.submitTransaction(createFligthTx);
                });
        });
    });
});
