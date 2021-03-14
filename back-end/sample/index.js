const schema = require('./schema');

module.exports = async function (fastify) {
    

    fastify.post('/sample', { schema: schema.addSample, preValidation: [fastify.authenticate] }, addSampleHandler);
    fastify.get('/sample', { schema: schema.getSample }, getSampleHandler);
    fastify.put('/sample', { schema: schema.updateSample }, updateSampleHandler);
    fastify.delete('/sample', { schema: schema.deleteSample }, deleteSampleHandler);

    // fastify.setErrorHandler(function (error, request, reply) {
    //     console.log(error); // switch to fastify logger
    //     /** if (!error.custom) error.message = 'Internal Server Error'; by adding a custom property to any errors we manually throw we can filter them out here
    //     any error we are not manually throwing can contain info about our system so we overwrite those error messages before sending them back
    //      */
    //     // switch error message here
    //     reply.code(500).send(error);
    // })
}

module.exports[Symbol.for('plugin-meta')] = {
    decorators: {
        fastify: [
            'sampleService',
        ]
    }
}

async function addSampleHandler({ body: requestBody }, res) {
    const { keyId, keySecret } = requestBody;
    return await this.sampleService.addSample({ keyId, keySecret});
}

async function getSampleHandler({ body: requestBody }, res) {
    return await this.sampleService.getSample();
}

async function updateSampleHandler({ body: requestBody }, res) {
    const { keyId, keySecret } = requestBody;
    return await this.sampleService.updateSample({ keyId, keySecret});
}

async function deleteSampleHandler({ body: requestBody }, res) {
    return await this.sampleService.deleteSample();
}

module.exports.handlers = {
    addSampleHandler,
    getSampleHandler,
    updateSampleHandler,
    deleteSampleHandler
}
