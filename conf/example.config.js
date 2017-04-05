module.exports = {
  connectors: {
    'appc.oracledb': {
// Your connection credentials.
      user: 'hr',
      password: 'oracledb',
      connectString: 'localhost/orcl',

// Create models based on your schema that can be used in your API.
      generateModelsFromSchema: true,

// Whether or not to generate APIs based on the methods in generated models.
      modelAutogen: false
    }
  }
}
