/**
* @factory
*/
function _InitClient(
    promise
    , setTimeout
    , node_process
    , net_http_webSocket
    , net_http_userAgent
    , client
    , utils_applyIf
    , utils_copy
    , utils_decycleStringify
    , is_nill
    , is_string
    , is_object
    , reporter
    , defaults
    , constants
    , info
    , errors
) {
    /**
    * @alias
    */
    var webSocket = net_http_webSocket
    /**
    * @alias
    */
    , userAgent = net_http_userAgent
    ;

    return InitClient;

    /**
    * @worker
    */
    function InitClient(args) {
        try {
            //initialize the config
            var config = initializeConfig(
                args
            );
            //open the web socket
            openWebSocket(
                config
            );

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    };
    /**
    * @function
    */
    function initializeConfig(args) {
        //remove the external reference
        var config = utils_copy(
            args
        );
        //add the defaults
        utils_applyIf(
            defaults.test.client
            , config
        );
        //create the url from the namespace if missing
        if (!config.url && !!config.hostname) {
            config.url = `wss://${config.hostname}`;
            if (!!config.port) {
                config.url = `${config.url}:${config.port}`;
            }
        }

        if (!!node_process) {
            node_process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
        }

        addListeners(
            config
        );

        return config;
    }
    /**
    * @function
    */
    function addListeners(config) {
        config.listeners = {
            "open": function open() {
                config.opened = true;
                reporter.info(
                    info.test.client.socket_opened
                );
            }
            , "error": function error(error) {
                reporter.error(
                    error
                );
            }
            , "close": function close() {
                config.opened = false;
                reporter.info(
                    info.test.client.socket_closed
                );
                //wait a bit and try to open again
                waitForConnection(
                    config
                );
            }
        };
    }
    /**
    * @function
    */
    function openWebSocket(config) {
        //create a web socket connected to the test server
        var conn = webSocket(
            config
        );
        //add the message listener
        conn.on(
            "message"
            , handleMessage.bind(null, conn, config)
        );
    }
    /**
    * @function
    */
    function waitForConnection(config) {
        setTimeout(
            openWebSocket
            , config.waitTimeout || defaults.test.client.waitTimeout
            , config
        );
    }
    /**
    * @function
    */
    function handleMessage(conn, config, message) {
        var msgId;
        //parse the message and start the process
        parseMessageToInstruction(
            message
        )
        //run the instruction on the client
        .then(function thenExecuteInstruction(instructionPackage) {
            msgId = instructionPackage.messageId;
            return executeInstruction(
                config
                , instructionPackage.instruction
                , instructionPackage.data
            );
        })
        //then let the server know we're done (or error)
        .then(function thenSignalComplete(result) {
            var msg = `${msgId}done`;
            if (is_string(result)) {
                msg = `${msg}:${result}`;
            }
            else if (is_object(result)) {
                msg = `${msg}:${utils_decycleStringify(result)}`;
            }
            else {
                msg = `${msg}`;
            }
            conn.send(
                msg
            );
        })
        .catch(function catchInstructionError(err) {
            var errorText = err;
            if (!!err && err.stack) {
                errorText = err.stack;
            }
            ///LOGGING
            reporter.error(
                `${errorText} MsgId: ${msgId}`
            );
            ///END LOGGING
            conn.send(
                `${msgId}err:${errorText}`
            );
        });
    }
    /**
    * @function
    */
    function parseMessageToInstruction(message) {
        try {
            //convert the buffer to a string
            if (!is_string(message)) {
                message = message.toString("utf8");
            }
            //the message should be {instruction}:{data}
            var msgId = message.substring(0, 32)
            , msg = message.substring(32)
            , delimIndex = msg.indexOf(":")
            , instruction = delimIndex !== -1
                ? msg.substring(0, delimIndex)
                : msg
            , data = delimIndex !== -1
                && msg.substring(delimIndex + 1)
            ;
            ///LOGGING
            reporter.extended(
                `${info.test.client.recieved_message} (${msgId} ${instruction})`
            );
            ///END LOGGING

            //resolve the instruction package
            return promise.resolve(
                {
                    "messageId": msgId
                    , "instruction": instruction
                    , "data": data
                }
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function executeInstruction(config, instruction, data) {
        try {
            ///INPUT VALIDATION
            if (is_nill(instruction)) {
                throw new Error(
                    errors.test.client.invalid_message
                );
            }
            if (constants.test.instructions.indexOf(instruction) === -1) {
                throw new Error(
                    `${errors.test.client.invalid_instruction} (${instruction})`
                );
            }
            ///END INPUT VALIDATION
            var instructionFunc = client[
                instruction
            ]
            , entry = JSON.parse(data)
            , clientMeta = {
                "environment": userAgent.browser.name === "node"
                    ? "node"
                    : "browser"
                , "userAgent": userAgent
                , "clientId": getClientId(
                    config
                )
            }
            ;
            return instructionFunc(
                entry
                , clientMeta
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function getClientId(config) {
        var clientId = config.clientId
        , browser = userAgent.browser
        ;
        if (!clientId) {
            clientId = browser.name;
            if (!!browser.version) {
                if (!!browser.version.major) {
                    clientId+= `.${browser.version.major}`;
                }
                if (!!browser.version.minor) {
                    clientId+= `.${browser.version.minor}`;
                }
                if (!!browser.version.patch) {
                    clientId+= `.${browser.version.patch}`;
                }
                if (!!browser.version.build) {
                    clientId+= `.${browser.version.build}`;
                }
            }
        }
        return clientId;
    }
}