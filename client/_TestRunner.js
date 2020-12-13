/**
* @factory
*/
function _TestRunner(
    promise
    , global
    , importDependency
    , runTest
    , runSetup
    , test_mocks
    , is_error
    , reporter
    , defaults
) {

    return TestRunner;

    /**
    * @worker
    */
    function TestRunner(config, clientMeta, testItems) {
        //create the base collection of dependencies
        return createDependencyCollection(
            config
            , clientMeta
            , testItems.unit
        )
        //execute the setup entries
        .then(function thenExecuteSetup(testDependencies) {
            return executeSetupEntries(
                config
                , testItems.setup
                , testDependencies
            );
        })
        //then run the tests
        .then(function thenRunTests(testDependencies) {
            return runTests(
                config
                , testItems.test
                , testDependencies
            );
        });
    }

    /**
    * @function
    */
    function createDependencyCollection(config, clientMeta, unitItems) {
        try {
            var deps = {
                "$config": config
                , "$client": clientMeta
                , "$import": importDependency.bind(
                    null
                    , unitItems
                )
                , "$global": global
                , "$reporter": reporter
                , "unit": {}
                , "mock": test_mocks
            };
            //add the unit entries, meta data and all
            Object.keys(unitItems)
            .forEach(function forEachUnit(unitKey) {
                var unit = unitItems[unitKey];
                deps.unit[unit.name] = unit;
            });

            return promise.resolve(deps);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * Loops through the setup test items and for each, resolves any dependencies, executes the setup factory functions and creates a collection of the results, by the name provided in the entry.
    * @function
    */
    function executeSetupEntries(config, setupEntries, testDependencies) {
        try {
            //a collection for storing the results of setup factory's execution.
            var setupDeps = Object.create(
                testDependencies
            )
            , environment = testDependencies.$client.environment
            , setupProcs = [];

            Object.keys(setupEntries)
            //sort the keys based on the entry index value, if exists
            .sort(function sortKeys(keya, keyb) {
                var entrya = setupEntries[keya]
                , entryb = setupEntries[keyb]
                , indexa = entrya.index || defaults.test.client.noIndex
                , indexb = entryb.index || defaults.test.client.noIndex
                ;
                if (indexa < indexb) {
                    return -1;
                }
                else if (indexa > indexb) {
                    return 1;
                }
                else {
                    return 0;
                }
            })
            //loop through the keys and execute each factory
            .forEach(function forEachEntry(key) {
                var entry = setupEntries[key];
                setupProcs.push(
                    runSetup(
                        entry
                        , setupDeps
                    )
                );
            });

            //wait for all of the setup promises to resolve
            return promise.all(
                setupProcs
            )
            //then check to see if any setup entries failed
            .then(function thenCheckSetupResults(results) {
                for(let result in results) {
                    if (is_error(result)) {
                        return promise.reject(result);
                    }
                }
                //resolve the resulting dependencies
                return promise.resolve(setupDeps);
            });
        }
        catch (ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function runTests(config, tests, testDependencies) {
        try {
            var testKeys = Object.keys(tests)
            //start a promise chain
            , proc = promise.resolve()
            , results = []
            , passed = true
            , exception
            , keys = Object.keys(tests)
            ;

            if (keys.length === 0) {
                return promise.resolve(
                    {
                        "passed": false
                        , "tests": []
                    }
                );
            }

            keys
            .forEach(function forEachTest(testKey, indx) {
                //process the results from the last test
                proc = proc.then(function thenRecordResult(result) {
                    if (indx > 0) {
                        results.push(result);
                        passed = passed && result.passed;
                        if (!!result.exception && !exception) {
                            exception = result.exception;
                        }
                    }
                    return promise.resolve();
                })
                .then(function thenRunNextTest() {
                    return runTest(
                        tests[testKey]
                        , testDependencies
                    );
                });
            });

            //process the last result
            proc = proc.then(function thenRecordResult(result) {
                results.push(result);
                passed = passed && result.passed;
                if (!!result.exception && !exception) {
                    exception = result.exception;
                }
                return promise.resolve(
                    {
                        "passed": passed
                        , "tests": results
                        , "exception": exception
                    }
                );
            });

            return proc;
        }
        catch (ex) {
            return promise.reject(ex);
        }
    }
}