#!groovy
@Library('pipeline-library') _

timestamps {
	// Force to a non-axway network build node to be able to connect to Oracle DB
	node('git && curl && unzip && osx') {
		stage('Checkout') {
			checkout scm
		}

		def nodeToUse = '4.7.3'
		stage('Configuration') {
			echo '*********** INSTALLING ORACLE INSTANT CLIENT ***********'
			// TODO Use parallel to download and unzip these two files
			sh 'rm -rf oracle'
			sh 'curl -k -L -O https://github.com/appcelerator/appc.oracledb/releases/download/2.0.1/instantclient-basic-macos.x64-12.1.0.2.0.zip'
			sh 'curl -k -L -O https://github.com/appcelerator/appc.oracledb/releases/download/2.0.1/instantclient-sdk-macos.x64-12.1.0.2.0.zip'
			sh 'mkdir oracle'
			sh 'unzip instantclient-basic-macos.x64-12.1.0.2.0.zip -d oracle'
			sh 'unzip instantclient-sdk-macos.x64-12.1.0.2.0.zip -d oracle'
			sh 'mv oracle/instantclient_12_1 oracle/instantclient'
			dir('oracle/instantclient') {
				sh 'ln -s libclntsh.dylib.* libclntsh.dylib'
			}

			def nodeHome = tool(name: "node ${nodeToUse}", type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation')
			withEnv(["PATH+NODE=${nodeHome}/bin", "OCI_LIB_DIR=${env.WORKSPACE}/oracle/instantclient", "OCI_INC_DIR=${env.WORKSPACE}/oracle/instantclient/sdk/include"]) {
				sh 'npm install oracledb'
			}
			sh "echo \"module.exports = {connectors: {'appc.oracledb': { }}};\" > conf/local.js"
		}

		buildConnector {
			nodeVersion = nodeToUse // make sure we use the same node version for installing oracledb above and in building the connector
		}
	}
}
