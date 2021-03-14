const env = {
    type : 'object',
    require : [ 
        'FASTIFY_PORT', 
        'MONGO_CONNECTION_STRING', 
        'ACCESS_TOKEN_SECRET_KEY', 
        'GUEST_TOKEN_SECRET_KEY'],
    properties: {
      FASTIFY_PORT : {type : 'integer'},
      MONGO_CONNECTION_STRING : { type : 'string' },
      ACCESS_TOKEN_SECRET_KEY : { type : 'string' },
      GUEST_TOKEN_SECRET_KEY : { type : 'string' }
    },
    additionalProperties: false
  };
  
  const swaggerOption = {
    swagger: {
      info: {
        title: 'Taxi Pooler APIs',
        description: 'Testing the APIs',
        version: '2.0.0'
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json']
    },
    exposeRoute: true
  }
  
  module.exports = {
    env,
    swaggerOption
  }
  