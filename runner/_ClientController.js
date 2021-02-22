/**
* @factory
*/
function _ClientController(
    promise
    , setTimeout
    , is_array
    , is_nill
    , is_error
    , is_uuid
    , is_string
    , utils_uuid
    , utils_copy
    , eventEmitter
    , reporter
    , defaults
    , errors
    , infos
) {

    /**
    *
    * @property
    */
    var clients = {}
    /**
    * @constants
    */
    , cnsts = {
        "uuidConfig": {
            "version": 4
            , "format": [
                "clean"
            ]
        }
    }
    , ClientController = Object.create(
        eventEmitter()
        , {
            "register": {
                "enumerable": true
                , "value": registerClient
            }
            , "deregister": {
                "enumerable": true
                , "value": deregisterClient
            }
            , "clients": {
                "enumerable": true
                , "get": function getClients() {
                    return Object.keys(clients);
                }
            }
            , "clientMeta": {
                "enumerable": true
                , "value": clientMeta
            }
            , "sendMessage": {
                "enumerable": true
                , "value": sendMessage
            }
        }
    )
    ;

    /**
    * @worker
    */
    return ClientController;

    /**
    * @function
    */
    function registerClient(clientApi) {
        var id = clientApi.id
        , client = {
            "clientApi": clientApi
            , "handles": {}
        };
        clients[id] = client;
        clientApi.on("message", receiveMessage.bind(null, id));
        clientApi.on("error", handleError.bind(null, id));
        clientApi.on("close", handleClose.bind(null, id));

        //record the client meta
        sendMessage(
            "meta"
            , id
        )
        .then(function thenRecordClientMeta(result) {
            try {
                result = result[id];
                if (is_error(result)) {
                    client.exception = result;
                }
                else {
                    client.meta = JSON.parse(result);
                }
            }
            catch(ex) {
                client.exception = ex;
            }
        });
    }
    /**
    * @function
    */
    function handleClose(id) {
        ClientController.emit(
            "close"
            , id
        );
        //deregister the client
        deregisterClient(
            id
        );
    }
    /**
    * @function
    */
    function deregisterClient(id) {
        var client = clients[id];
        delete clients[id];
        //resolve any handles
        Object.keys(client.handles)
        .forEach(function forEachHandle(id) {
            var handle = client.handles[id];
            handle();
        });
    }
    /**
    * @function
    */
    function receiveMessage(clientId, message) {
        if (!is_string(message)) {
            message = message.toString("utf8");
        }
        //get the handle for this message
        var client = clients[clientId]
        , msgId = message.substring(0, 32)
        , handle, msg, delimIndex, status, response
        ;
        //no client, must mean it was dropped from the client list
        if (!client) {
            reporter.error(
                `${errors.test.runner.client_missing} (${clientId})`
            );
            return;
        }
        ///LOGGING
        reporter.extended(
            `${infos.test.runner.message_received} (${clientId}, ${msgId})`
        );
        ///END LOGGING
        //get the handle for this message id
        handle = client.handles[msgId];
        //if we have a handle resolve the message
        if (!!handle) {
            delete client.handles[msgId];
            msg = message.substring(32);
            delimIndex = msg.indexOf(":");
            status = delimIndex === -1
                ? msg
                : msg.substring(0, delimIndex)
            ;
            response = msg.substring(delimIndex + 1);
            //resolve the message
            if (status === "done") {
                if (response === status) {
                    response = undefined;
                }
                handle(response);
            }
            else if (status === "err") {
                handle(
                    new Error(
                        response.replace("Error:", "")
                    )
                );
            }
            else {
                handle(
                    new Error(
                        `${errors.test.runner.invalid_response}`
                    )
                );
            }
        }
        //otherwise nothing to do
        else {
            reporter.error(
                `${errors.test.runner.missing_handle} (${msgId})`
            );
            ///TODO: what to do if there isn't a handle
        }
    }
    /**
    * @function
    */
    function handleError(id, error) {
        //if the client is no longer open then deregister it
        var clientApi = clients[id].clientApi;
        if (clientApi.status !== "OPEN") {
            deregisterClient(
                id
            );
        }
    }
    /**
    * @function
    */
    function sendMessage(message, id) {
        //get a concrete list of clients
        var clientIds = is_uuid(id)
            ? [id]
            : is_array(id)
                ? id
                : Object.keys(clients)
        //create a new message id
        , messageId = utils_uuid(
            cnsts.uuidConfig
        )
        //send the message to those clients
        , procs = clientIds
            .map(function createMessageProc(clientId) {
                return new promise(
                    sendMessageToClient.bind(
                        null
                        , message
                        , clientId
                        , messageId
                    )
                );
            })
        , allProcs = promise.all(
            procs
        )
        , timeoutProc = new promise(
            function messageTimeout(resolve) {
                setTimeout(
                    resolve
                    , defaults.test.runner.clientMessageTimeout
                );
            }
        );
        //wait for and process the results
        return promise.race(
            [
                allProcs
                , timeoutProc
            ]
        )
        //then process the results
        .then(function thenProcessResults(results) {
            //undefined means that the timeout process has fired
            if (results === undefined) {
                return promise.reject(
                    `${errors.test.runner.message_timeout}`
                );
            }
            return processResults(
                messageId
                , clientIds
                , results
            );
        });
    }
    /**
    * @function
    */
    function sendMessageToClient(message, clientId, msgId, resolve, reject) {
        try {
            if (!clients.hasOwnProperty(clientId)) {
                throw new Error(
                    `${errors.test.runner.client_missing} (${clientId}, ${msgId})`
                );
            }
            //add the handle for this message
            clients[clientId].handles[msgId] = resolve;
            //send the message
            clients[clientId].clientApi
                .send(
                    `${msgId}${message}`
                )
            ;
            ///LOGGING
            reporter.extended(
                `${infos.test.runner.message_sent} (${clientId}, ${msgId})`
            );
            ///END LOGGING
        }
        catch(ex) {
            ///LOGGING
            reporter.error(
                `${errors.test.runner.message_failed} (${clientId}, ${msgId})`
            );
            ///END LOGGING
            //remove the handle
            if (!!clients[clientId]) {
                delete clients[clientId].handles[msgId];
            }

            resolve(ex);
        }
    }
    /**
    * @function
    */
    function processResults(messageId, clientIds, results) {
        var clientResults = {};

        clientIds
        .forEach(function forEachClientId(id, indx) {
            clientResults[id] = results[indx];
        });

        return promise.resolve(clientResults);
    }
    /**
    * @function
    */
    function clientMeta(id) {
        var client = clients[id];
        if (!client) {
            reporter.error(
                `${errors.test.runner.client_invalid} (${id})`
            );
            return;
        }
        return utils_copy(
            client.meta
        );
    }
}