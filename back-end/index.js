// importing libraries
const fp = require('fastify-plugin')
const env = require('fastify-env')
const jwt = require('fastify-jwt')
const swagger = require('fastify-swagger')
const mongodb = require('fastify-mongodb')
const cors = require('fastify-cors');
const SampleService = require('./sample/service')
const UserService = require('./Auth/service')
const RideService = require('./rides/service')

// declaring schemas
const {
	env: envSchema,
	swaggerOption: swaggerOption,
} = require('./schema')

// connecting to db
async function connectToDatabases(fastify) {
	fastify.register(mongodb, {
		forceClose: true,
		url: fastify.config.MONGO_CONNECTION_STRING
	})
}

// setting up auth
async function setupAuth(fastify) {
	fastify.register(jwt, {
		secret: fastify.config.ACCESS_TOKEN_SECRET_KEY
	})

	fastify.decorate("authenticate", async function (request, reply) {
		await request.jwtVerify()
	})

	fastify.decorate("adminsOnly", function({user}, reply, done) {
		if(user && user.isAdmin) {
			done();
			return true;
		}else{
			done(Error("Unauthorized attempt to access admin route"));
			return false;
		}
	})
}

async function decorateFastifyInstance(fastify) {
	const db = fastify.mongo.db
	const mongoID = fastify.mongo.ObjectId;
	fastify.decorate('db', db)

	const sampleService = new SampleService(db, mongoID)
	fastify.decorate('sampleService', sampleService)

	const userService = new UserService(db, mongoID)
	fastify.decorate('userService', userService)

	const rideService = new RideService(db, mongoID)
	fastify.decorate('rideService', rideService)

}

//exporting the modules
module.exports = async function (fastify, opts) {
	fastify.register(swagger, swaggerOption)
		.register(cors, {})
		.register(env, { schema: envSchema, data: [opts] }).after(err => { if (err) throw err })
		.register(fp(connectToDatabases))
		.register(fp(setupAuth))
		.register(fp(decorateFastifyInstance))
		.register(require('./Auth'), { prefix: '/auth' })
		.register(require('./rides'), { prefix: '/ride' })
		// .register(require('./sample'), { prefix: '/s' })
}
