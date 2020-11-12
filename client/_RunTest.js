/**
* @factory
*/
function _RunTest(
    promise
    , performance
    , setTimeout
    , testHead
    , utils_asyncFunction
    , utils_reference
    , utils_funcInspector
    , is_func
    , is_promise
    , is_number
    , is_error
    , globalRedeclarationList
    , reporter
    , errors
    , info
) {
    /**
    * A regular expression pattern to replace underscores
    * @property
    */
    var LD_PATT = /[_]/g
    /**
    * @constants
    */
    , cnsts = {
        "testStageNames": [
            "arrange"
            , "act"
            , "assert"
        ]
    };

    return RunTest;

    /**
    * @worker
    */
    async function RunTest(test, testDependencies) {
        try {
            //hydrate the test if the value doesn't already exist
            if (!test.hasOwnProperty("value")) {
                test.value = await hydrateTestFactory(
                    test
                    , testDependencies
                );
            }
            var testFactory = test.value
            //get the test factory's dependencies
            , testFactoryDeps = resolveDependencies(
                test
                , testDependencies
                , test.dependencies
            )
            , testToken = {
                "testName": test.name
                , "runtimes": {}
                , "assertions": []
                , "passed": true
            } //execute the test factory
            , factoryResult =
                testFactory.apply(
                    null
                    , testFactoryDeps
                )
            , proc = promise.resolve()
            ;
            //the test factory could be async
            if (is_promise(factoryResult)) {
                proc = proc.then(
                    function thenWaitForTestFactory() {
                        return factoryResult;
                    }
                );
            }
            //run the wrapped test stage functions, arrange, act, assert
            proc = proc.then(
                function thenRunTestStages() {
                    return runTestStageFuncs(
                        test.testFuncs
                        , testToken
                        , testDependencies
                    );
                }
            );
            //then process assertion results
            return proc.then(
                function thenProcessAssertionResults() {
                    return processAssertionResults(
                        testToken
                    );
                }
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }

    /**
    * Converts the test factory function text to an async function with the arrange, act, and assert function wrappers
    * @function
    */
    function hydrateTestFactory(test, testDependencies) {
        //create the body for the async function that will hydrate the text
        var testFactoryText = `"use strict";\nreturn ${test.data};`
        //get the list of globals to hide based on the environment
        , hideGlobalList = globalRedeclarationList[
            testDependencies.$client.environment
        ]
        //create the arguments list, starting with AAA and then the globals
        , testFactoryFuncArgs =
            [
                "arrange"
                , "act"
                , "assert"
            ]
            .concat(
                hideGlobalList
            )
        //add the test factory as the last argument
        , testFactoryFuncArgsBody =
            testFactoryFuncArgs
            .concat(
                testFactoryText
            )
        //create the async function that will hydrate the factory
        , testFactoryFunc = utils_asyncFunction.apply(
            null
            , testFactoryFuncArgsBody
        )
        //create a container for the wrapped AAA function callback values
        , testFuncs = {}
        //create the wrapper functions
        , arrange = setAAAFunc.bind(
            null
            , testFuncs
            , "arrange"
        )
        , act = setAAAFunc.bind(
            null
            , testFuncs
            , "act"
        )
        , assert = setAAAFunc.bind(
            null
            , testFuncs
            , "assert"
        )
        ;

        test.testFuncs = testFuncs;

        //hydrate the factory
        return testFactoryFunc(
            arrange
            , act
            , assert
        );
    }
    /**
    * The callback for the test's arrange, act, and assert calls
    * @function
    */
    function setAAAFunc(testFuncs, name, func) {
        if (!is_func(func)) {
            throw new Error(
                `${errors.test.client.invalid_aaa_function} (${name}, type ${typeof func})`
            );
        }
        //add funciton meta data
        func.signature = utils_funcInspector(
            func
        );
        testFuncs[name] = func;
    }
    /**
    * @function
    */
    function resolveDependencies(entry, testDependencies, funcArgs) {
        //create an object that includes the meta $entry
        var deps = Object.create(
            testDependencies
            , {
                "$entry": {
                    "value": entry
                }
            }
        );

        return funcArgs.map(
            resolveDependency.bind(
                null
                , deps
            )
        );
    }
    /**
    * @function
    */
    function resolveDependency(deps, name) {
        var path = name.replace(LD_PATT, ".")
        , ref = utils_reference(
            path
            , deps
        )
        ;
        if (!ref.found) {
            throw new Error(
                `${errors.test.client.missing_dependency} (${path})`
            );
        }
        return ref.value;
    }
    /**
    * @function
    */
    function runTestStageFuncs(testStageFuncs, testToken, testDependencies) {
        //start a promise chain
        var proc = promise.resolve();
        //loop through the test functions, arrange, act, assert, and create a promise for the execution of each
        cnsts.testStageNames
        .forEach(
            function forEachStageName(testStageName) {
                proc = proc.then(
                    function thenRunNext() {
                        return runTestStageFunc(
                            testStageName
                            , testStageFuncs[testStageName]
                            , testToken
                            , testDependencies
                        );
                    }
                );
            }
        );

        return proc;
    }
    /**
    * @function
    */
    function runTestStageFunc(
        testStageName
        , testStageFunc
        , testToken
        , testDependencies
    ) {
        try {
            ///LOGGING
            reporter.extended(
                `${info.test.client.executing_test_stage} (${testStageName})`
            );
            ///END LOGGING
            //create a dependency object using the test deps as the proto
            var deps = Object.create(
                testDependencies
            )
            , funcArgs = testStageFunc
                .signature
                .params
            , argValues
            , doneToken
            , start
            , result
            , proc = promise.resolve()
            ;

            if (funcArgs.indexOf("test") !== -1) {
                deps.test = testHead(
                    testToken.assertions
                );
            }
            if (funcArgs.indexOf("done") !== -1) {
                doneToken = createDoneToken();
                deps.done = doneToken.doneFunc;
            }
            //resolve the function args
            argValues =
                testStageFunc
                .signature
                .params
                .map(
                    resolveDependency.bind(
                        null
                        , deps
                    )
                )
            ;
            //execute the test function and record the result in case it's a promise
            start = performance.now();
            result = testStageFunc.apply(
                null
                , argValues
            );
            //if the result is a promise, then wait for it to resolve
            if (is_promise(result)) {
                proc = proc.then(
                    function thenWaitForResultPromise() {
                        return result;
                    }
                );
            }
            //if there is a done token, wait for the promise to resolve
            if (!!doneToken) {
                proc = proc.then(
                    function thenWaitForDone() {
                        return doneToken.donePromise;
                    }
                );
            }
            //then record the total runtime
            return proc.then(
                function thenRecordRuntime() {
                    testToken.runtimes[testStageName] =
                        performance.now() - start;
                    //
                    return promise.resolve(testToken);
                }
            );
        }
        catch(ex) {
            testToken.exception = ex;
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function createDoneToken() {
        var doneToken = {};
        //create a promise which is resolved/rejected based on a callback
        doneToken.donePromise = new Promise(
            function donePromise(resolve, reject) {
                doneToken.doneFunc = doneFunction.bind(
                    null
                    , resolve
                    , reject
                )
            }
        );

        return doneToken;
    }
    /**
    * @function
    */
    function doneFunction(resolve, reject, arg) {
        if (is_error(arg)) {
            reject(arg);
        }
        else if (is_number(arg)) {
            setTimeout(
                function doneDelay() {
                    resolve();
                }
                , arg
            )
        }
        else {
            resolve();
        }
    }
    /**
    * @function
    */
    function processAssertionResults(testToken) {
        try {
            //set the passed variable
            testToken.passed = true;

            testToken
            .assertions
            .forEach(
                function forEachAssertion(assertion) {
                    //convert the error to a string for serialization
                    if (is_error(assertion.error)) {
                        if (!!assertion.error.stack) {
                            assertion.error = assertion.error.stack;
                        }
                        else {
                            assertion.error = `${assertion.error}`;
                        }
                    }
                    testToken.passed = testToken.passed
                        && assertion.passed
                        || false
                    ;
                }
            );

            return promise.resolve(testToken);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
}