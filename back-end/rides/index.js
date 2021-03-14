// imports
const schema = require('./schema');

// importing module functions
module.exports = async function (fastify) {

	fastify.get('/location', { schema: schema.getLocations }, getLocations);
	fastify.post('/location', { schema: schema.addLocation, preValidation: [fastify.authenticate, fastify.adminsOnly] }, addLocation);

	fastify.get('/roads', { schema: schema.getRoads }, getRoads);
	fastify.post('/roads', { schema: schema.addRoad, preValidation: [fastify.authenticate, fastify.adminsOnly] }, addRoad);

	fastify.get('/vehicle', { schema: schema.getVehicles, preValidation: [fastify.authenticate] }, getVehicles);
	fastify.get('/vehicle/project', { schema: schema.getVehicles, preValidation: [fastify.authenticate] }, getVehiclesProject);
	fastify.post('/vehicle', { schema: schema.addVechicle, preValidation: [fastify.authenticate, fastify.adminsOnly] }, addVehicle);

	fastify.get('/trip', { schema: schema.getAllTrips, preValidation: [fastify.authenticate, fastify.adminsOnly] }, getAllTrips); // all
	fastify.get('/trip/project', { schema: schema.getAllTrips, preValidation: [fastify.authenticate, fastify.adminsOnly] }, getAllTripsProjection); // all
	// fastify.get('/trip', { schema: schema.getVehicles }, getVehicles); // all pooled format
	fastify.get('/trip/me', { schema: schema.getAllTrips, preValidation: [fastify.authenticate] }, getTrips); // mine
	fastify.get('/trip/me/project', { schema: schema.getAllTrips, preValidation: [fastify.authenticate] }, getTripsProjection); // mine
	fastify.post('/trip', { schema: schema.bookTrip, preValidation: [fastify.authenticate] }, bookTrip); // book
	fastify.delete('/trip', { schema: schema.cancelTrip, preValidation: [fastify.authenticate] }, cancelTrip); // cancel

}

module.exports[Symbol.for('plugin-meta')] = {
	decorators: {
		fastify: [
			'jwt',
			'rideService',
		]
	}
}

async function cancelTrip({body, user}){
	const {userID} = user;
	const {tripID} = body;
	return await this.rideService.cancelTrip({userID, tripID});
}

async function addLocation({ body }) {
	const { name, roadName } = body;
	if (name === "kamand") throw Error("kamand already exists");
	return await this.rideService.addLocation({ location: name, road: roadName });
}

async function getLocations() {
	return await this.rideService.getAllLocations();
}

async function getRoads() {
	return await this.rideService.getRoads();
}

async function addRoad({ body: road }) {
	road.locations = ["kamand"];
	return await this.rideService.addRoad({ road });
}

async function getVehicles() {
	return await this.rideService.getVehicles();
}

async function getVehiclesProject() {
	const lis = await this.rideService.getVehicles();
	return await this.rideService.getVehicleProjection(lis);
}

async function addVehicle({ body: vehicle }) {
	// set default values
	vehicle.freeSeats = vehicle.maxCapacity;
	vehicle.road_id = {};
	vehicle.date = "";
	vehicle.isAssigned = false;
	return await this.rideService.addVehicle({ vehicle });
}

async function getAllTrips() {
	return await this.rideService.getAllTrips();
}

async function getAllTripsProjection() {
	const arr = await this.rideService.getAllTrips();
	return await this.rideService.getTripProjection(arr);
}

async function getTrips({ user }) {
	const { userID } = user;
	return await this.rideService.getTrips({ userID });
}

async function getTripsProjection({ user }) {
	const { userID } = user;
	const arr = await this.rideService.getTrips({ userID });
	return await this.rideService.getTripProjection(arr);
}

async function bookTrip({ body: trip, user }) {
	const { userID } = user;
	return await this.rideService.bookTrip({ trip, userID });
}


//export of module functions
module.exports.handlers = {
	getLocations,
	addLocation,
	getRoads,
	addRoad,
	getVehicles,
	addVehicle
}
