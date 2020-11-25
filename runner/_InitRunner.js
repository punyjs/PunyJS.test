/**
*
* @factory
*/
function _RunnerInit(
    promise
    , setTimeout
    , runnerLoop
    , clientController
    , node_path
    , node_fs
    , node_dirName
    , node_process
    , net_http_webSocket
    , workspacePath
    , utils_copy
    , utils_applyIf
    , is_string
    , fs_fileLoader
    , reporter
    , defaults
    , errors
) {
    /**
    * @property
    */
    var NS_PATT = /^(?:[A-z_$][A-z0-9_$]*(?:[.](?!$))?)+$/
    /**
    * @property
    */
    , DOT_PATT = /[.]/g
    /**
    * @property
    */
    , webSocketServer
    /**
    * @property
    */
    , fileWatcher
    ;

    /**
    * @worker
    */
    return function RunnerInit(cmdArgs) {
        var runnerConfig, exitCode;
        //create the configuration
        return createConfig(
            cmdArgs
        )
        //then initiaize the test runner
        .then(function thenInitialize(config) {
            runnerConfig = config;
            return initialize(
                runnerConfig
            );
        })
        //then start the runner
        .then(function thenStartRunnerLoop(control) {
            return runnerLoop(
                runnerConfig
                , control
            );
        })
        //then cleanup resources
        .then(function thenCleanup(code) {
            exitCode = code || 0;
            return new promise(
                cleanupResources.bind(null, null)
            );
        })
        //catch errors so we can cleanup resources
        .catch(function catchError(err) {
            exitCode = 1001;
            return new promise(
                cleanupResources.bind(null, err)
            );
        })
        //finally send an exit code
        .finally(function finallyExit() {
            node_process.exit(exitCode);
        });
    };

    /**
    * @function
    */
    function createConfig(cmdArgs) {
        try {
            //create the configuration with the cmdArgs
            var config = utils_copy(
                cmdArgs.arguments
            );
            ///INPUT VALIDATION
            //we must have a test namespace
            if (
                Object.keys(config).indexOf("namespace") === -1
                || !NS_PATT.test(config.namespace)
            ) {
                throw new Error(
                    `${errors.invalid_test_namespace}`
                );
            }
            ///END INPUT VALIDATION
            //create the path to the test files based on the namespace
            config.path = node_path.join(
                workspacePath
                , "build"
                , config.namespace.replace(DOT_PATT, "/")
            );
            //look for the verbosity flags
            if (cmdArgs.flags.indexOf("v") !== -1) {
                config.verbosity =
                    cmdArgs.flags.filter(
                        function filterFlags(flag) {
                            return flag === "v";
                        }
                    )
                    .length
                ;
            }
            //parse the testEntry config
            if (config.testEntry) {
                if (is_string(config.testEntry)) {
                    config.testEntry = config.testEntry.split(",")
                }
            }

            //add any defaults
            utils_applyIf(
                defaults.test.runner
                , config
            );

            //test that the path exists
            return new promise(
                testPath.bind(
                    null
                    , config
                )
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function testPath(config, resolve, reject) {
        node_fs.access(
            config.path
            , function accessCb(err) {
                if (!!err) {
                    reject(err)
                }
                else {
                    resolve(config);
                }
            }
        );
    }
    /**
    * @function
    */
    function initialize(config, control) {
        var control = {};
        //initialize the stdin listener
        return initStdInControl(
            config
            , control
        )
        //initialize the watcher
        .then(function thenInitWatcher() {
            return initWatcher(
                config
                , control
            );
        })
        //initiaize the web server
        .then(function thenInitWebSocket() {
            return initWebSocket(
                config
            );
        })
        //then return the control object
        .then(function thenReturnControl() {
            return promise.resolve(control);
        });
    }
    /**
    * @function
    */
    function initStdInControl(config, control) {
        try {
            //add a listener for stdin, just a simple trigger to end the program
            node_process.stdin.on("data", function checkStdIn(buff) {
                //remove the \r\n at the end of the buffer
                buff = buff[buff.length - 2] === 13
                    ? buff.slice(0, buff.length - 2)
                    : buff.slice(0, buff.length - 1)
                ;
                var data = buff.toString();
                if (data === "quit" || data === "exit") {
                    //turn off the loop and wait for the cleanup process to complete
                    control.stop = true;
                    node_process.stdin.removeAllListeners("data");
                    return;
                }
                else if (data === "run") {
                    control.run = true;
                }
                node_process.stdout.write(">");
            });

            //start the test console
            node_process.stdout.write("\n>");

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function initWatcher(config, control) {
        try {
            //add a watcher for the test directory
            fileWatcher = node_fs.watch(
                config.path
                , function fileChange() {
                    control.run = true;
                }
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
    function initWebSocket(config) {
        //get the key and cert files
        return loadCertFiles(
            config
        )
        //then create the http2 server
        .then(function thenCreateWebSocketServer(certFiles) {
            return createWebSocketServer(
                config
                , certFiles[0]
                , certFiles[1]
            );
        });
    }
    /**
    * @function
    */
    function createWebSocketServer(config, key, cert) {
        try {
            //create the server and wire it to the client registry
            webSocketServer = net_http_webSocket({
                "cert": cert
                , "key": key
                , "port": config.port
                , "listeners": {
                    "open": function open(socketApi) {
                        clientController.register(
                            socketApi
                        );
                    }
                    , "serverError": function serverError(error, serverApi) {
                        ///TODO: what do we do on a server error, what kind of errors could we see and should we close the process
                        console.log(`server error: ${error}`)
                    }
                    , "serverClose": function serverClose(serverApi) {
                        ///TODO: do we clean up resources here or is the closing always server initialted.
                        console.log("server close");
                    }
                }
            });

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function loadCertFiles(config) {
        return promise.all([
            fs_fileLoader(
                 node_path.join(
                     node_dirName
                     , config.key
                 )
             )
            , fs_fileLoader(
                 node_path.join(
                     node_dirName
                     , config.cert
                 )
             )
        ]);
    }
    /**
    * @function
    */
    function cleanupResources(err, resolve, reject) {
        ///LOGGING
        if (!!err) {
            reporter.error(err);
        }
        ///END LOGGING
        var cleanupCnt = 0;
        if (!!webSocketServer) {
            cleanupCnt++;
            try {
                webSocketServer.close(function webSocketClosed() {
                    cleanupCnt--;
                    if (cleanupCnt === 0) {
                        resolve();
                    }
                });
            }
            catch(ex) {
                cleanupCnt--;
                reporter.error(ex);
            }
        }
        if (!!fileWatcher) {
            cleanupCnt++;
            try {
                fileWatcher.on("close", function watcherClosed() {
                    cleanupCnt--;
                    if (cleanupCnt === 0) {
                        resolve();
                    }
                });
                fileWatcher.close();
            }
            catch(ex) {
                cleanupCnt--;
                reporter.error(ex);
            }
        }
        if (cleanupCnt !== 0) {
            setTimeout(
                failsafe
                , defaults.test.runner.shutdownWaitMs
            );
        }
        //a fail safe in case the resources don't finish cleaning up
        function failsafe() {
            if (cleanupCnt !== 0) {
                reject(
                    new Error(
                        `${errors.test_runner_shutdown_timeout}`
                    )
                );
            }
        }
    }
}