/**
* @factory
*/
function _Client(
    promise
    , testRunner
    , is_array
    , reporter
    , errors
    , defaults
    , infos
) {
    /**
    * A categorized collection of test items, units under test, setup factories and test factories
    * @property
    *   @private
    */
    var testItems = {
        "unit": {}
        , "setup": {}
        , "test": {}
    };

    return Object.create(null, {
        "add": {
            "enumerable": true
            , "value": add
        }
        , "remove": {
            "enumerable": true
            , "value": remove
        }
        , "execute": {
            "enumerable": true
            , "value": execute
        }
        , "meta": {
            "enumerable": true
            , "value": meta
        }
        , "reset": {
            "enumerable": true
            , "value": reset
        }
    });

    /**
    * @function
    */
    function add(entry) {
        try {
            var key = entry.type;

            if (testItems[key].hasOwnProperty(entry.id)) {
                throw new Error(
                    `${errors.test.client.dependency_exits} (${key}.${entry.id})`
                );
            }
            ///LOGGING
            reporter.extended(
                `${infos.test.client.adding_entry} (${entry.type} ${entry.id})`
            );
            ///END LOGGING

            testItems[key][entry.id] = entry;

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function remove(id) {
        try {
            ///LOGGING
            reporter.extended(
                `${infos.test.client.removing_entry} (${id})`
            );
            ///END LOGGING
            if (testItems.setup.hasOwnProperty(id)) {
                delete testItems.setup[id];
            }
            else if (testItems.test.hasOwnProperty(id)) {
                delete testItems.test[id];
            }
            else if (testItems.unit.hasOwnProperty(id)) {
                delete testItems.unit[id];
            }

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function execute(config, clientMeta) {
        ///LOGGING
        reporter.info(
            `${infos.test.client.executing_tests}`
        );
        ///END LOGGING
        return testRunner(
            config
            , clientMeta
            , testItems
        );
    }
    /**
    * @function
    */
    function meta(entry, clientMeta) {
        return promise.resolve(
            clientMeta
        );
    }
    /**
    * @function
    */
    function reset() {
        ///LOGGING
        reporter.info(
            `${infos.test.client.resetting_client}`
        );
        ///END LOGGING
        //rebuild the testItems collection
        testItems = {
            "unit": {}
            , "setup": {}
            , "test": {}
        };
        return promise.resolve();
    }
}