const successMessage = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  },
  required: ['message'],
  additionalProperties: false
}

const sampleObj = {
  type: 'object',
  properties: {
    keyId: { type: 'string' },
    keySecret: { type: 'string' }
  },
  required: ['keyId', 'keySecret'],
  additionalProperties: false
}

const AuthHeader = {
  type: 'object',
  require: ['Authorization'],
  properties: {
    Authorization: { type: 'string' },
  }
}

const addSample = {
  description: `Add Sample API`,
  tags: ['Sample'],
  body: sampleObj,
  headers: AuthHeader,
  response: {
    200: successMessage
  }
}

const getSample = {
  description: `Get Sample API`,
  tags: ['Sample'],
  headers: AuthHeader,
  response: {
    200: successMessage
  }
}

const updateSample = {
  description: `Update Sample API`,
  tags: ['Sample'],
  body: sampleObj,
  headers: AuthHeader,
  response: {
    200: successMessage
  }
}

const deleteSample = {
  description: `Delete Sample API`,
  tags: ['Sample'],
  headers: AuthHeader,
  response: {
    200: successMessage
  }
}

module.exports = {
  addSample,
  getSample,
  updateSample,
  deleteSample
}
