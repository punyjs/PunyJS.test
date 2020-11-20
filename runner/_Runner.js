/**
* The runner loads the test package and runs the test process for all connected and responsive clients.
* During the first step of the test process, a reset message is sent to all of the clients and the resulting responses are used to create a list of test clients (the responsive ones).
* The next step runs the test
* @factory
*/
function _Runner(
    promise
    , performance
    , fs_fileLoader
    , node_path
    , clientController
    , tester
    , is_error
    , reporter
    , defaults
    , constants
    , info
) {

    /**
    * @worker
    */
    return function Runner(config) {
        var testPackage, clientList;
        //load the test package
        return loadTestPackage(
            config
        )
        //then generate the client list based on reset results
        .then(function thenGenerateClientList(loadedPackage) {
            testPackage = loadedPackage;
            return generateClientList(
                config
            );
        })
        //execute the test for the testPackage and clientList
        .then(function thenRunTest(clients) {
            clientList = clients;
            return tester(
                config
                , testPackage
                , clientList
            );
        })
        .then(function thenMarkEnd(results) {
            return markEnd(
                clientList
            );
        });
    };

    /**
    * @function
    */
    function loadTestPackage(config) {
        //determine the test package path
        return createTestPackagePath(
            config
        )
        //then load test package file
        .then(function thenloadTestPackage(filePath) {
            return fs_fileLoader(
                filePath
            );
        })
        .then(function thenParseData(data) {
            return parseTestPackage(
                data
            );
        });
    }
    /**
    * @function
    */
    function createTestPackagePath(config) {
        try {
            var testFilename = config.testFileName
                || defaults.test.runner.testFileName
            , path = node_path.join(
                config.path
                , testFilename
            );

            return promise.resolve(path)
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function parseTestPackage(data) {
        try {
            var testPackage = JSON.parse(data);

            return testPackage;
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function generateClientList(config) {
        ///LOGGING
        reporter.info(
            `${info.test.runner.resetting_clients}`
        );
        ///END LOGGING
        //send the RESET message to all clients
        return clientController.sendMessage(
            "reset"
        )
        //process the results into a test record
        .then(function thenProcessClientResults(results) {
            return processResetClientResults(
                results
            );
        });
    }
    /**
    * @function
    */
    function processResetClientResults(clientResults) {
        try {
            var clientList = {};

            Object.keys(clientResults)
            .forEach(function forEachResult(clientId) {
                var clientResult = clientResults[clientId];
                //if this client isn't an error, create a client test record
                if (!is_error(clientResult)) {
                    clientList[clientId] = createClientRecord(clientId);
                }
            });

            return promise.resolve(clientList);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    * @interface iTestClient
    */
    function createClientRecord(id) {
        return {
            "ready": true
            , "start": Math.floor(performance.now() * constants.convert.NS_MS)
            , "meta": clientController.clientMeta(id)
            , "loadingLog": []
            , "iterations": []
            , "passed": true
        };
    }
    /**
    * @function
    */
    function markEnd(clientList) {
        try {
            if (!clientList) {
                return promise.resolve([]);
            }
            Object.keys(clientList)
            .forEach(function forEachResult(clientId) {
                clientList[clientId].end =
                    Math.floor(performance.now() * constants.convert.NS_MS);
            });

            return promise.resolve(clientList);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
}