/**
*
* @factory
*/
function _ConsoleRecorder(
    promise
    , is_empty
) {

    return ConsoleRecorder;

    /**
    * @worker
    */
    function ConsoleRecorder(config, testResults) {
        return processClients(
            config
            , testResults
        )
    }

    /**
    * @function
    */
    function processClients(config, testResults) {
        try {
            var clientsData = [];

            //each key in test results is a client
            Object.keys(testResults)
            .forEach(function forEachClient(clientId) {
                var clientData =
                    processClient(
                        config
                        , testResults[clientId]
                    );
                clientsData = clientsData.concat(clientData);
            });

            return promise.resolve(clientsData);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function processClient(config, clientResults) {
        console.log("");
        console.log("***********************************");
        console.log("Client Id: ", clientResults.meta.clientId);
        console.log("");

        if (!!clientResults.exception) {
            console.log(clientResults.exception);
        }
        else if (config.verbosity > 1) {
            console.group();
            //for each iteration
            clientResults.iterations.forEach(
                processIteration.bind(null, config)
            );
            console.groupEnd();
        }

        console.log("-----------------------------------");
        console.log("Everything Passed: ", clientResults.passed || false);

        if (config.verbosity == 1) {
            var stats = getIterationStats(
                clientResults.iterations[0]
            );
            console.log("");
            console.log("Iteration Count: ", clientResults.iterations.length);
            console.log("Test Count: ", stats.testCount);
            console.log("Passed Count: ", stats.passedCount);
            console.log("Failed Count: ", stats.failedCount);
        }

        console.log("-----------------------------------");

    }
    /**
    * @function
    */
    function processIteration(config, iteration, index) {
        var iterationId = iteration.id
        , stats = getIterationStats(
            iteration
        )
        ;

        console.log("Iteration: ", index + 1);
        console.log(
            "Tests Passed: "
            , stats.passedCount
            , " of "
            , stats.testCount
        );
        console.log("");

        if (config.verbosity > 2 && !!iteration.results) {
            console.group();
            //loop through the tests
            iteration.results.tests
            .forEach(
                processResult.bind(null, config, iteration.results.tests)
            );
            console.groupEnd();
        }


    }
    /**
    * @function
    */
    function processResult(config, results, result) {
        var testName = result.testName
        , runtimes = result.runtimes
        , assertions = result.assertions
        , stats = getAssertionStats(
            assertions
        )
        ;

        console.log("Test: ", testName);
        console.log(
            "Assertions Passed: "
            , stats.passedCount
            , " of "
            , stats.assertionCount
        );
        console.log("");

        if (config.verbosity > 3) {
            console.group();
            //loop through the assertions
            assertions.forEach(
                processAssertion.bind(null, config)
            );
            console.groupEnd();
            console.log("");
        }

    }
    /**
    * @function
    */
    function processAssertion(config, assertion) {
        if (config.verbosity > 4 || assertion.passed === false) {
            console.log("Title: ", assertion.title);
            console.log("Results: ", assertion.results);
        }
    }
    /**
    * @function
    */
    function getIterationStats(iteration) {
        var testCount = 0
        , passedCount = 0
        ;

        if (!!iteration.results) {
            iteration.results.tests
            .forEach(function forEachTest(test) {
                testCount++;
                if (test.passed) {
                    passedCount++;
                }
            });
        }

        return {
            "passed": iteration.passed
            , "testCount": testCount
            , "passedCount": passedCount
            , "failedCount": testCount - passedCount
        };
    }
    /**
    * @function
    */
    function getAssertionStats(assertions) {
        var passedCount =
            assertions.filter(
                function filterAssertions(assertion) {
                    return assertion.passed;
                }
            )
            .length
        ;

        return {
            "assertionCount": assertions.length
            , "passedCount": passedCount
            , "failedCount": assertions.length - passedCount
        };
    }
}