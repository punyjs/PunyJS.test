/**
* Performs the loading of the unit-under-test, setup, and test entries
* @factory
*/
function _InitTestClients(
    testEntryLoader
    , is_string
    , reporter
    , infos
) {


    return InitTestClients;

    /**
    * @worker
    */
    function InitTestClients(config, testPackage, clientList) {
        //upload the unit under test on the client
        return loadUnitUnderTest(
            config
            , testPackage
            , clientList
        )
        //then upload the test level setup entries
        .then(function thenLoadTestSetup() {
            return loadTestSetup(
                config
                , testPackage
                , clientList
            );
        })
        //then upload the test entries
        .then(function thenLoadTest() {
            return loadTests(
                config
                , testPackage
                , clientList
            );
        });
    }

    /**
    * @function
    */
    function loadUnitUnderTest(config, testPackage, clientList) {
        ///LOGGING
        reporter.info(
            `${infos.test.runner.upload_uuit}`
        );
        ///END LOGGING
        //load the unit under test entries
        return testEntryLoader(
            testPackage
            , clientList
            , "unit"
            , "add"
        );
    }
    /**
    * @function
    */
    function loadTestSetup(config, testPackage, clientList) {
        ///LOGGING
        reporter.info(
            `${infos.test.runner.upload_test_setup}`
        );
        ///END LOGGING
        //load the unit under test entries
        return testEntryLoader(
            testPackage
            , clientList
            , "setup"
            , "add"
        );
    }
    /**
    * @function
    */
    function loadTests(config, testPackage, clientList) {
        ///LOGGING
        reporter.info(
            `${infos.test.runner.upload_test}`
        );
        ///END LOGGING
        //if there is a testEntry config property then reduce the test package
        if (!!config.testEntry) {
            testPackage = testPackage.filter(
                function filterTestPackage(entry) {
                    if (entry.type === "test") {
                        if (config.testEntry.indexOf(entry.name) === -1) {
                            return false;
                        }
                    }
                    return true;
                }
            );
        }
        //load the unit under test entries
        return testEntryLoader(
            testPackage
            , clientList
            , "test"
            , "add"
        );
    }
}