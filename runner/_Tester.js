/**
* The tester executes the test workflow using a test package and list of test clients. The result of each step of the workflow is recorded. Any clients that fail a step in the workflow will be left off the list for subsequent steps.
* Test Workflow
*   1. Setup the Test
    Pull the test level setup entries and run each entry command on each client.
*   2. Run 1..n Iterations
    Loop 1..n times an run the iteration sub workflow for each loop.
*   2a. Setup the Iteration
    Pull the iteration level setup entries, excluding iteration specific entries that are not for the current iteration.
*   2b. Pull Test Items
    Pull the test entries, excluding iteration specific entries that are not for the current iteration.
*   2c. Run 1..len Test Items
    Loop 1..len, where len is the length of the test items array.
*   2ba. Setup Test Item
    Execute the test factory, creating the arrange, act, assert functions with bindings from the test item factory.
*   2bb. Run Test Item
    Run the arrange, act, assert functions
*   2bc. Record the results
    Record the result and runtime of each of the three functions.
* @factory
*/
function _Tester(
    promise
    , initTestClients
    , testEntryLoader
    , testIterations
    , is_empty
    , reporter
    , infos
) {

    return Tester;

    /**
    * @worker
    */
    function Tester(config, testPackage, clientList) {
        var testResults;

        if (is_empty(clientList)) {
            ///LOGGING
            reporter.info(
                infos.test.runner.no_clients
            );
            ///END LOGGING
            return promise.resolve();
        }
        //load the uut, setup, and test entries
        return initTestClients(
            config
            , testPackage
            , clientList
        )
        //then run the iterations, execute each test x times
        .then(function thenRunIterations() {
            return testIterations(
                config
                , testPackage
                , clientList
            );
        })
        //then cleanup the setup and uut entries
        .then(function thenCleanupTest(results) {
            testResults = results;
            ///LOGGING
            reporter.info(
                `${infos.test.runner.cleanup_test}`
            );
            //END LOGGING
            return cleanupTest(
                config
                , testPackage
                , clientList
            );
        });
    }
    /**
    * @function
    */
    function cleanupTest(config, testPackage, clientList) {
        return cleanupSetup(
            config
            , testPackage
            , clientList
        )
        .then(function thenCleanupUnit() {
            return cleanupUnit(
                config
                , testPackage
                , clientList
            );
        });
    }

    function cleanupSetup(config, testPackage, clientList) {
        //get the unit entries
        return testEntryLoader(
            testPackage
            , clientList
            , "setup"
            , "remove"
        );
    }
    /**
    * @function
    */
    function cleanupUnit(config, testPackage, clientList) {
        //get the unit entries
        return testEntryLoader(
            testPackage
            , clientList
            , "unit"
            , "remove"
        );
    }
}