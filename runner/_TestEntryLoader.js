/**
* A shared utility used to upload test entries. Whether they're uuts', setup, or test entries, we load them all.
* @factory
*/
function _TestEntryLoader(
    promise
    , performance
    , testMessageSender
    , is_error
    , reporter
    , infos
    , constants
) {

    return TestEntryLoader;

    /**
    * @worker
    */
    function TestEntryLoader(
        testPackage
        , clientList
        , entryType
        , action
        , iteration = -1
    ) {
        //get the entries from the test package
        return getTestPackageEntries(
            testPackage
            , entryType
            , iteration
        )
        //send the entries to the clients
        .then(function thenSendEntries(entries) {
            var len = entries.length;
            ///LOGGING
            reporter.extended(
                `${infos.test.runner.sending_entries} (${action} ${entryType} ${len})`
            );
            ///END LOGGING
            if (len !== 0) {
                return sendEntries(
                    clientList
                    , entryType
                    , action
                    , iteration
                    , entries
                );
            }
            return promise.resolve();
        });
    }
    /**
    * @function
    */
    function getTestPackageEntries(testPackage, entryType, iteration = -1) {
        try {
            var entries = [];

            testPackage
            .forEach(function forEachItem(entry) {
                if(entry.type !== entryType) {
                    return;
                }
                //if the entry has an iteration property
                if (entry.hasOwnProperty("iteration")) {
                    //if the entry's iteration is not equal to current iteration
                    if (entry.iteration != iteration) {
                        return;
                    }
                }
                //if iteration is not -1 then this is not the entry for it
                else if (iteration !== -1) {
                    return;
                }

                entries.push(entry);
            });

            return promise.resolve(entries);
        }
        catch(ex) {
            promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function sendEntries(clientList, entryType, action, iteration, entries) {
        var len = entries.length
        , clientIds = Object.keys(clientList)
            .filter(function filterClients(clientId) {
                return clientList[clientId].ready;
            })
        , procs = clientIds.length > 0
            ? entries.map(
                function thenSendMessage(entry, index) {
                    var data = entry;
                    if (action === "remove") {
                        data = `"${entry.id}"`;
                    }
                    ///LOGGING
                    reporter.extended(
                        `${infos.test.runner.sending_entry} (${action} ${entryType} ${index + 1} of ${len})`
                    );
                    ///END LOGGING
                    return testMessageSender(
                        clientIds
                        , action
                        , data
                    );
                }
            )
            : []
        ;

        //wait for all of the messages to come back
        return promise.all(
            procs
        )
        //then process the results and update the clients
        .then(function thenUpdateClients(results) {
            return processResults(
                clientList
                , entryType
                , action
                , iteration
                , entries
                , results
            );
        });
    }
    /**
    * @function
    */
    function processResults(
        clientList
        , entryType
        , action
        , iteration
        , entries
        , results
    ) {
        //loop through the results and match them with their entries
        results.forEach(function forEachResult(result, index) {
            var entry = entries[index];
            //loop through the clients and match them with thier result
            Object.keys(clientList)
            .forEach(
                processClientResults.bind(
                    null
                    , clientList
                    , entryType
                    , action
                    , iteration
                    , entry
                    , result
                )
            );
        });
    }
    /**
    * @function
    */
    function processClientResults(
        clientList
        , entryType
        , action
        , iteration
        , entry
        , result
        , clientId
        , index
    ) {
        try {
            if (result === undefined) {
                return;
            }
            var client = clientList[clientId]
            , clientResult = result[clientId]
            , iterationIndex, store
            , record = {
                "id": entry.id
                , "type": entryType
                , "action": action
                , "timestamp": Math.floor(performance.now() * constants.convert.NS_MS)
            }
            ;
            //if the result is an error, take the client offline
            if (client.ready && is_error(clientResult)) {
                client.exception = clientResult;
                client.ready = false;
            }
            //not an iteration this is for loading an entry, add it to the log
            if (iteration === -1) {
                store = client.loadingLog;
            }
            //otherwise add it to the iterations array
            else {
                iterationIndex = iteration - 1;
                //ensure there is an array for this iteration
                if(!client.iterations.hasOwnProperty(iterationIndex)) {
                    client.iterations[iterationIndex] = [];
                }
                store = client.iterations[iterationIndex];
            }
            //add the record to the chosen store
            store.push(record);

            if (is_error(clientResult)) {
                record.exception = clientResult;
            }
            //parse the client result as JSON
            else if (!!clientResult) {
                record.result = JSON.parse(clientResult);
            }
        }
        catch(ex) {
            record.exception = ex;
        }
        finally {
            if (!!record.exception && !client.hasOwnProperty("exception")) {
                client.exception = record.exception;
            }
        }
    }
}