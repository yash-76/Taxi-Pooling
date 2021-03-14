const successMessage = {
	type: 'object',
	properties: {
		message: { type: 'string' }
	},
	required: ['message'],
	additionalProperties: false
}

const AuthHeader = {
	type: 'object',
	required: ['Authorization'],
	properties: {
		Authorization: { type: 'string' },
	}
}

const noStructObj = {
	type: 'object',
	additionalProperties: true
}

const roadObject = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		locations: {
			type: 'array',
			items: {
				type: 'string'
			}
		}
	},
	required: ['name', 'locations']
}
const roadObjectInput = {
	type: 'object',
	properties: {
		name: { type: 'string' }
	},
	required: ['name']
}

const vehicleObject = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		maxCapacity: { type: 'integer' },
		freeSeats: { type: 'integer' },
		road_id: noStructObj, // roadID
		date: { type: 'string' }, // add regex for date, must be in DD-MM-YYYY
		isAssigned: { type: 'boolean' }
	},
	required: [
		'name',
		'maxCapacity',
		'freeSeats',
		'road_id',
		'date',
		'isAssigned',
	],
	additionalProperties: true
}
const vehicleObjectInput = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		maxCapacity: { type: 'integer' },
	},
	required: [
		'name',
		'maxCapacity',
	]
}

const tripObject = {
	type: 'object',
	properties: {
		_id : { type: 'string' },
		userID: { type: 'string' },
		numOfPassengers: { type: 'integer' }, // should be greater than 0
		vehicleID: noStructObj,
		date: { type: 'string' },
		source: { type: 'string' },
		dest: { type: 'string' },
	},
	required: [
		'userID',
		'numOfPassengers',
		'vehicleID',
		'source',
		'dest',
		'date',
	],
	additionalProperties: true
}
const tripObjectInput = {
	type: 'object',
	properties: {
		numOfPassengers: { type: 'integer' }, // should be greater than 0
		date: { type: 'string' },
		source: { type: 'string' },
		dest: { type: 'string' },
	},
	required: [
		'numOfPassengers',
		'source',
		'dest',
		'date',
	]
}

// schemas

const getLocations = {
	description: 'get a map of \< id : location name \>',
	tags: ['locations'],
	headers: AuthHeader,
	response: {
		200: {
			type: 'array',
			items: { type: 'string' }
		}
	}
}

const addLocation = {
	description: 'add location',
	tags: ['locations'],
	headers: AuthHeader,
	body: {
		type: 'object',
		properties: {
			name: { type: 'string' },
			roadName: { type: 'string' },
		},
		required: ['name', 'roadName']
	},
	response: {
		200: successMessage
	}
}

const getRoads = {
	description: 'get all roads',
	tags: ['roads'],
	headers: AuthHeader,
	response: {
		200: {
			type: 'array',
			items: roadObject
		}
	}
}

const addRoad = {
	description: 'add new road',
	tags: ['roads'],
	headers: AuthHeader,
	body: roadObjectInput,
	response: {
		200: successMessage
	}
}

const getVehicles = {
	description: 'get all Vehicles',
	tags: ['Vehicles'],
	headers: AuthHeader,
	response: {
		200: {
			type: 'array',
			items: vehicleObject
		}
	}
}

const addVechicle = {
	description: 'add new vehicle',
	tags: ['Vehicles'],
	headers: AuthHeader,
	body: vehicleObjectInput,
	response: {
		200: successMessage
	}
}

const getAllTrips = {
	description: 'get all trips',
	tags: ['trips'],
	headers: AuthHeader,
	response: {
		200: {
			type: 'array',
			items: tripObject
		}
	}
}

const bookTrip = {
	description: 'book trip',
	tags: ['trips'],
	headers: AuthHeader,
	body: tripObjectInput,
	response: {
		200: successMessage
	}
}

const cancelTrip = {
	description: 'cancel trip',
	tags: ['trips'],
	headers: AuthHeader,
	body: {
		type : 'object',
		properties : {
			tripID : {type : 'string'}
		},
		required : ['tripID']
	},
	response: {
		200: successMessage
	}
}


module.exports = {
	cancelTrip,
	getLocations,
	addLocation,
	getRoads,
	addRoad,
	getVehicles,
	addVechicle,
	bookTrip,
	getAllTrips
}
