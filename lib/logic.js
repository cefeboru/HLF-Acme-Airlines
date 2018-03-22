'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * @param {org.acme.airlines.flight.CreateFlight} flightData
 * @transaction
 */
function CreateFlight(flightData) {
    return getAssetRegistry('org.acme.airlines.flight.Flight')
        .then(function(flightRegistry){
            // 2. Get resource factory
            var  factory = getFactory();
            var  NS =  'org.acme.airlines.flight';
            // 3. Create the Resource instance
            var  flightId = flightData.origin + '-' + getFormatedDate(flightData.schedule);
            var  flight = factory.newResource(NS,'Flight', flightId);
            // 4. Set the relationship
            flight.flightNumber = flightData.flightNumber;
            // 5. Create a new concept using the factory & set the data in it
            var route = factory.newConcept(NS,'Route');

            route.origin = flightData.origin;
            route.destination = flightData.destination;
            route.schedule = flightData.schedule;
            flight.route = route;
            flight.aliasFlightNumber = [];

            // 6. Emit the event FlightCreated
            var event = factory.newEvent(NS, 'FlightCreated');
            event.flightId = flightId;
            emit(event);

            return flightRegistry.addAll([flight]);
        });
}

/** Return date in format DD-MM-YYYY */
function getFormatedDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth();
    var yy = date.getFullYear();
    return [dd, mm, yy].join('-');
}