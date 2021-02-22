/**
*
* @factory
*/
function _TestIterations(
    promise
    , performance
    , testEntryLoader
    , testMessageSender
    , utils_retrocycleParse
    , is_error
    , reporter
    , infos
    , constants
) {

    return TestIterations;

    /**
    * @worker
    */
    function TestIterations(config, testPackage, clientList) {
        ///LOGGING
        reporter.info(
            `${infos.test.runner.start_iterations}`
        );
        ///END LOGGING
        var currentIteration = 0
        , totalIterations = config.totalIterations || 1
        , proc = promise.resolve()
        , results = []
        , passed = true
        ;

        for(let i = 0; i <= totalIterations; i++) {
            //add a process to the chain
            proc = proc.then(function thenRunNextIteration(result) {
                if (result !== undefined) {
                    passed = passed && result.passed;
                    results.push(result);
                }
                currentIteration++;
                if (currentIteration <= totalIterations) {
                    return runIteration(
                        config
                        , testPackage
                        , clientList
                        , currentIteration
                    )
                }
                else {
                    return promise.resolve(
                        {
                            "passed": passed
                            , "iterations": results
                        }
                    );
                }
            });
        }

        return proc;
    }

    /**
    * @function
    */
    function runIteration(config, testPackage, clientList, iteration) {
        var testResults = {

        };

        ///LOGGING
        reporter.info(
            `${infos.test.runner.upload_iteration_setup} (${iteration})`
        );
        ///END LOGGING
        return testEntryLoader(
            testPackage
            , clientList
            , "setup"
            , "add"
            , iteration
        )
        .then(function thenUploadIterationTests() {
            ///LOGGING
            reporter.info(
                `${infos.test.runner.upload_iteration_tests} (${iteration})`
            );
            ///END LOGGING
            return testEntryLoader(
                testPackage
                , clientList
                , "test"
                , "add"
                , iteration
            );
        })
        //then run the tests
        .then(function thenRunTests() {
            return runTests(
                config
                , testPackage
                , clientList
                , iteration
            );
        })
        //then cleanup the iteration
        .then(function thenCleanupIteration(results) {
            testResults = results;
            ///LOGGING
            reporter.info(
                `${infos.test.runner.cleanup_iteration} (${iteration})`
            );
            //END LOGGING
            return cleanupTest(
                config
                , testPackage
                , clientList
                , iteration
            );
        })
        .then(function thenReturnResults() {
            //console.log(testResults)
            return promise.resolve(testResults);
        });
    }
    /**
    * @function
    */
    function cleanupTest(config, testPackage, clientList, iteration) {
        //remove the tests
        return testEntryLoader(
            testPackage
            , clientList
            , "test"
            , "remove"
            , iteration
        )
        //then remove the setup
        .then(function thenRemoveSetup() {
            return testEntryLoader(
                testPackage
                , clientList
                , "setup"
                , "remove"
                , iteration
            );
        });
    }
    /**
    * @function
    */
    function runTests(config, testPackage, clientList, iteration) {
        ///LOGGING
        reporter.info(
            `${infos.test.runner.execute_test}`
        );
        ///END LOGGING
        //load the unit under test entries
        var clientIds = Object.keys(clientList)
            .filter(function filterClients(clientId) {
                return clientList[clientId].ready;
            })
        , executeConfig = {}
        ;
        if (!!config.testNum) {
            executeConfig.testNum = config.testNum;
        }
        if (!!config.testId) {
            executeConfig.testId = config.testId;
        }
        if (!!config.unitReporterLevels) {
            executeConfig.reporterLevels = config.unitReporterLevels;
        }
        return testMessageSender(
            clientIds
            , "execute"
            , executeConfig
        )
        //then process the results and update the clients
        .then(function thenRecordResult(results) {
            return processExecuteResults(
                clientList
                , iteration
                , results
            );
        });
    }
    /**
    * @function
    */
    function processExecuteResults(clientList, iteration, clientResults) {
        try {
            if (!clientResults) {
                return promise.resolve();
            }

            Object.keys(clientResults)
            .forEach(function forEachResult(id, index) {
                var iterationNum = iteration - 1
                , client = clientList[id]
                , processedClientResult = processClientResult(
                    clientResults[id]
                    , iterationNum
                )
                ;
                client.passed = client.passed
                    && processedClientResult.passed
                    || false
                ;
                client.iterations[iterationNum] = processedClientResult;
            });

            return promise.resolve(clientList);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function processClientResult(result, iterationIndex) {
        try {
            var record = {
                "id": `iteration.${iterationIndex}`
                , "timestamp":
                Math.floor(performance.now() * constants.convert.NS_MS)
            }
            , test;
            if (is_error(result)) {
                record.exception = result;
            }
            else if (!!result) {
                test = utils_retrocycleParse(result);
                record.passed = test.passed;
                record.results = test;
            }
        }
        catch (ex) {
            record.exception = ex;
        }
        return record;
    }
}