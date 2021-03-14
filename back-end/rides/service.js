class RideService {
	constructor(db, mongoID) {
		this.db = db;
		this.mongoID = mongoID;
		this.locations = this.db.collection("locations");
		this.roads = this.db.collection("roads");
		this.vehicles = this.db.collection("vehicles");
		this.trips = this.db.collection("trips");
		console.log("Ride Service created");
	}

	async getAllLocations() {
		const locationObjects = await this.locations.find().toArray();
		const LocationList = locationObjects.map((item) => item.location);
		return LocationList;
	}

	async addLocation({ location, road }) {
		const oldLoc = await this.locations.findOne({location});
		if(oldLoc != null) throw Error('this location is already present');
		const roadObj = await this.roads.findOne({ name: road });
		if(roadObj == null) throw Error('this route has not been registered yet');

		location = location.toLowerCase();

		await this.locations.insertOne({ location });

		let locationsList = roadObj.locations;
		locationsList.push(location);

		await this.roads.updateOne(
			{ name: road },
			{
				$set: {
					locations: locationsList,
				},
			}
		);

		return {
			message: "added",
		};
	}

	async addRoad({ road }) {
		// check for unique road name
		const {name} = road;
		const oldObj = await this.roads.findOne({name});
		if(oldObj != null) throw Error('this routename is already present');

		await this.roads.insertOne(road);
		return {
			message: "added successfully",
		};
	}

	async getRoads() {
		const roads = await this.roads.find().toArray();
		return roads;
	}

	async addVehicle({ vehicle }) {
		const {name} = vehicle;
		const oldObj = await this.vehicles.findOne({name});
		if(oldObj != null) throw Error('this vehicle name is already present');

		vehicle.isAssigned = false;
		await this.vehicles.insertOne(vehicle);
		return {
			message: "added successfully",
		};
	}

	async getVehicles() {
		const vehicles = await this.vehicles.find().toArray();
		return vehicles;
	}

	async getTrips({ userID }) {
		return await this.trips.find({ userID }).toArray();
	}

	async getAllTrips() {
		return await this.trips.find().toArray();
	}

	async bookTrip({ trip, userID }) {
		const { source, dest, date, numOfPassengers } = trip;
		if(source === "" || dest === "") throw Error('source and destination cannot be empty');
		if(source === dest) throw Error('source and destination cannot be same');
		let selectedVehicle;
		// find road
		const roadObj = await this.roads.findOne({
			locations: {
				$all: [source, dest],
			},
		});
		if (roadObj === null) {
			throw Error(`no route found from ${source} to ${dest}`);
		}
		const roadID = roadObj._id;

		// find cars with
		// > same road and same date;
		// > vacancy
		const vehicleObj = await this.vehicles.findOne({
			road_id: roadID,
			date: date,
			isAssigned: true,
			freeSeats: { $gte: numOfPassengers },
		});

		// vehicle on the same road with enough vacancy
		if (vehicleObj !== null) {
			// ideal scenario
			// update vehicle
			const filter = { _id: vehicleObj._id };
			let newPoolers = vehicleObj.poolers;
			newPoolers.push(userID);
			const updateOps = { 
				$inc: { freeSeats: -numOfPassengers },
				$set: {
					poolers : newPoolers
				}
			};
			await this.vehicles.updateOne(filter, updateOps);
			selectedVehicle = vehicleObj._id;
		} else {
			// try an empty vehicle
			const newVehicleObj = await this.vehicles.findOne({
				isAssigned: false,
				maxCapacity: { $gte: numOfPassengers },
			});

			if (newVehicleObj == null) {
				throw Error(
					`no vehicle available for this trip`
				);
			}
			const filter = { _id: newVehicleObj._id };
			const updateOps = {
				$set: {
					isAssigned: true,
					freeSeats: newVehicleObj.maxCapacity - numOfPassengers,
					road_id: roadID,
					date: date,
					poolers : [userID]
				},
			};
			await this.vehicles.updateOne(filter, updateOps);

			selectedVehicle = newVehicleObj._id;
		}

		// finalize trip
		// add trip
		await this.trips.insertOne({
			userID,
			numOfPassengers,
			vehicleID: selectedVehicle,
			date,
			source,
			dest,
		});

		return {
			message: "done",
		};
	}

	async cancelTrip({tripID, userID}) {
		tripID = new this.mongoID(tripID)
		const trip = await this.trips.findOne({_id : tripID});
		if(trip == null) throw Error('trip does not exist');
		if(trip.userID != userID) throw Error('You cannot cancel someone elses trip')
		await this.trips.removeOne({_id : tripID});
		const vecID = trip.vehicleID;
		const vehicle = await this.vehicles.findOne({_id : vecID});
		const filter = { _id: vecID };
		const isAssigned = trip.numOfPassengers + vehicle.freeSeats != vehicle.maxCapacity
		let newPoolers = vehicle.poolers.filter(item => item != trip.userID);
		const updateOps = {
			$inc: { freeSeats: trip.numOfPassengers },
			$set: {
				poolers : newPoolers,
				isAssigned,
			}
		};
		await this.vehicles.updateOne(filter, updateOps);
		return {
			message : "trip canceled successfully"
		}
	}

	async getTripProjection(tripList) {
		for (let i = 0; i < tripList.length; i++) {
			const vecID = tripList[i].vehicleID;
			const vecOBJ = await this.vehicles.findOne({ _id: vecID })
			tripList[i].vehicle = vecOBJ
		}

		return tripList;
	}

	async getVehicleProjection(vecList) {
		for (let i = 0; i < vecList.length; i++) {
			const roadID = vecList[i].road_id;
			const roadObj = await this.roads.findOne({ _id: roadID });
			vecList[i].road = roadObj;
		}

		return vecList;
	}
}

module.exports = RideService;
