// import schema
const schema = require('./schema');

// export module functions
module.exports = async function (fastify) {

	fastify.post('/register', { schema: schema.addUser }, registerUser);
	fastify.post('/adminFlag', { schema: schema.changeAdminFlag, preValidation: [fastify.authenticate, fastify.adminsOnly] }, changeAdminFlag);
	fastify.post('/login', { schema: schema.loginUser }, loginUser);
	fastify.post('/me', { schema: schema.userDetails, preValidation: [fastify.authenticate] }, getSelfID)
	// fastify.post('/me2', { schema: schema.userDetails, preValidation: [fastify.authenticate] }, testerEcho)

}

module.exports[Symbol.for('plugin-meta')] = {
	decorators: {
		fastify: [
			'jwt',
			'db',
			'userService',
		]
	}
}

async function testerEcho({ user }) {
	const { userID } = user;
	await this.userService.tester({ userID });
	return user;
}

// signup function
async function registerUser({ body: requestBody }, res) {
	const { userID, password, confirmPassword } = requestBody;
	const oldRecord = await this.userService.getUser({ userID });
	if (oldRecord !== null) {
		throw Error('this user already exists')
	}
	if (password != confirmPassword) {
		throw Error('password and confirm password don\'t match')
	}
	return await this.userService.addUser({ userID, password });
}

async function changeAdminFlag({ body, user }) {
	const { adminFlag, userID: targetUser } = body;
	return await this.userService.changeAdminFlag({ userID: targetUser, adminFlag });
}

// get userID from jwt token
async function getSelfID({ user }) {
	console.log(user);
	return user;
}

// attempt login, throw error if fails
async function loginUser({ body: requestBody }, res) {
	const { userID, password } = requestBody;
	const oldRecord = await this.userService.getUser({ userID });
	if (oldRecord === null) {
		throw Error('this user does not exist')
	}
	if (await this.userService.tryLoginUser({ userID, password })) {
		const userObj = await this.userService.getUser({ userID });
		const token = this.jwt.sign(userObj)
		return {
			'jwt': token,
			'user': userObj
		}
	} else {
		throw Error("wrong password")
	}
}

// export module objects
module.exports.handlers = {
	registerUser,
	loginUser,
	getSelfID
}
