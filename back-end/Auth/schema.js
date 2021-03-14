// schemas for differnt auth objects
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

const userRegister = {
	type: 'object',
	properties: {
		userID: { type: 'string' },
		password: { type: 'string' },
		confirmPassword: { type: 'string' }
	},
	required: ['userID', 'password', 'confirmPassword'],
	additionalProperties: false
}

// { userID: 'milind', iat: 1604949358 }
const userJWT = {
	type: 'object',
	properties: {
		userID: { type: 'string' },
		isAdmin: { type: 'boolean' },
	},
	required: ['userID', 'isAdmin']
}

const addUser = {
	description: `Register USER`,
	tags: ['Auth'],
	body: userRegister,
	response: {
		200: successMessage
	}
}

const userDetails = {
	description: `Get USER details`,
	tags: ['Auth'],
	headers: AuthHeader,
	response: {
		200: userJWT
	}
}

const loginUser = {
	description: `Login User`,
	tags: ['Auth'],
	body: {
		type: 'object',
		properties: {
			userID: { type: 'string' },
			password: { type: 'string' }
		},
		required: ['userID', 'password'],
		additionalProperties: false
	},
	response: {
		200: {
			type: 'object',
			properties: {
				jwt: { type: 'string' },
				user : userJWT
			},
			required: ['jwt'],
			additionalProperties: false
		}
	}
}

const changeAdminFlag = {
	description: `change admins status of user`,
	tags: ['Auth'],
	headers: AuthHeader,
	body: {
		type: 'object',
		properties: {
			userID: { type: 'string' },
			adminFlag: { type: 'boolean' }
		},
		required: ['userID', 'adminFlag'],
		additionalProperties: false
	},
	response: {
		200: successMessage
	}
}

module.exports = {
	addUser,
	loginUser,
	userDetails,
	changeAdminFlag
}
