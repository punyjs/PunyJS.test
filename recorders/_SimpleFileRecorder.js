/**
* @factory
*/
function _SimpleFileRecorder(
    promise
    , node_path
    , fs_fileWriter
    , utils_arrayArraytoCsvString
    , is_empty
) {
    /**
    * A regular expression pattern for replacing dots
    * @property
    */
    var DOT_PATT = /[.]/g
    /**
    * @constants
    */
    , cnsts = {
        "header": [
            "CLIENT_ID"
            , "ERROR"
            , "ITERATION_NUM"
            , "ITERATION_ID"
            , "TEST_NUM"
            , "TEST_NAME"
            , "ARRANGE_MS"
            , "ACT_MS"
            , "ASSERT_MS"
            , "ASSERTION_NUM"
            , "ASSERTION_TITLE"
            , "ASSERTION_PASS"
            , "ASSERTION_STEP_NUM"
            , "ASSERTION_STEP"
            , "ASSERTION_STEP_PASS"
            , "FIGURES"
        ]
    };

    return SimpleFileRecorder;

    /**
    * @worker
    */
    function SimpleFileRecorder(config, testResults) {
        return processClients(
            testResults
        )
        //then convert the array array to a csv string
        .then(function thenConvertRecords(records) {
            return convertRecords(
                records
            );
        })
        //then save the denormalized data
        .then(function thenSaveFile(data) {
            return saveFile(
                config
                , data
            );
        });
    }

    /**
    * @function
    */
    function processClients(testResults) {
        try {
            var clientsData = [];

            //each key in test results is a client
            Object.keys(testResults)
            .forEach(function forEachClient(clientId) {
                var clientData =
                    processClient(
                        testResults[clientId]
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
    function processClient(clientResults) {
        var clientId = clientResults.meta.clientId
        , records = []
        ;
        if (!!clientResults.exception) {
            records.push(
                [clientId, clientResults.exception]
            );
            return records;
        }

        //for each iteration
        clientResults.iterations
        .forEach(function forEachIteration(iteration, iterationNum) {
            var iterationId = iteration.id;

            //loop through the results
            iteration.results.tests
            .forEach(function forEachResult(test, testNum) {
                var testName = test.testName
                , runtimes = test.runtimes
                , assertions = test.assertions
                ;
                //loop through the assertions
                assertions
                .forEach(function forEachAssertion(assertion, assertionIndx) {
                    //loop through the assertion results
                    assertion.results
                    .forEach(function forEachAssertionResult(result, assertionStepIndx) {
                        //and create a record
                        var assertionStep = result.shift()
                        , assertionStepPass = result.shift()
                        , assertionStepFigures = !is_empty(result)
                            ? JSON.stringify(result)
                            : null
                        , record = [
                            clientId
                            , null
                            , iterationNum + 1
                            , iterationId
                            , testNum + 1
                            , testName
                            , runtimes.arrange
                            , runtimes.act
                            , runtimes.assert
                            , assertionIndx + 1
                            , assertion.title
                            , assertion.passed
                            , assertionStepIndx + 1
                            , assertionStep
                            , assertionStepPass
                            , assertionStepFigures
                        ];

                        records.push(
                            record
                        );
                    });
                });
            });
        });

        return records;
    }
    /**
    * @function
    */
    function convertRecords(records) {
        try {
            return utils_arrayArraytoCsvString(
                [cnsts.header].concat(records)
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function saveFile(config, data) {
        try {
            var path = !!config.testOutputPath
                ? config.testOutputPath
                : node_path.join(
                    config.path
                    , "testOutput"
                )
            , fileName = !!config.testOutputName
                ? config.testOutputName
                : config.namespace.replace(DOT_PATT, "_")
            ;
            //add the date time to the path
            fileName+= getFileSuffix();
            //add the csv suffix
            fileName+= ".csv";

            fs_fileWriter(
                node_path.join(
                    path
                    , fileName
                )
                , data
            );

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function getFileSuffix() {
        var fileDt = new Date()
        , year = `${fileDt.getFullYear()}`
        , month = `${fileDt.getMonth()}`.padStart(2, "0")
        , dt = `${fileDt.getDate()}`.padStart(2, "0")
        , hours = `${fileDt.getHours()}`.padStart(2, "0")
        , minutes = `${fileDt.getMinutes()}`.padStart(2, "0")
        , seconds = `${fileDt.getSeconds()}`.padStart(2, "0")
        ;
        return `${year}${month}${dt}-t${hours}${minutes}${seconds}`;
    }
}