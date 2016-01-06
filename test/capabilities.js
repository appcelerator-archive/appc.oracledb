var should = require('should'),
	Arrow = require('arrow'),
	server = new Arrow(),
	connector = server.getConnector('appc.oracle');

describe('Capabilities', Arrow.Connector.generateTests(connector, module));
