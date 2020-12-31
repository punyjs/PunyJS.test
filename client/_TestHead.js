/**
* @factory
*/
function _TestHead(
    proxy
    , test_assertions
    , test_conversions
    , is_array
    , is_error
    , is_objectValue
    , utils_lookup
    , errors
) {

    return TestHead;

    /**
    * @worker
    */
    function TestHead(assertions) {
        return startAssertion.bind(
            null
            , assertions
        );
    }
    /**
    * Starts a new assertion, sets the title, and returns a proxy object
    * @function
    */
    function startAssertion(assertions, title) {
        var assertion = {
            "title": title
            , "passed": false
            , "results": []
        }
        , assertionProxy =  new proxy(
            {}
            , {
                "get": function get(target, propName) {
                    return getTrap(
                        assertionProxy
                        , assertion
                        , target
                        , propName
                    );
                }
            }
        );

        assertions.push(
            assertion
        );

        return assertionProxy;
    }
    /**
    * @function
    */
    function getTrap(assertionProxy, assertion, target, propName) {
        //if there was an error skip the rest
        if (!!assertion.exception) {
            //return the proxy for chaining
            return assertionProxy;
        }
        var keys;
        if (propName === "value") {
            //set the passed boolean to start
            assertion.passed = true;
            assertion.valueSet = true;
            //return a callback that will be called with the value
            return setValue.bind(
                null
                , assertionProxy
                , assertion
            );
        }
        else if (propName === "not") {
            assertion.not = true;
            assertion.results.push(
                ["not"]
            );
            return assertionProxy;
        }
        else {
            if (!assertion.valueSet) {
                assertion.passed = false;
                assertion.exception = new Error(
                    `${errors.test.client.missing_assertion_value} (${assertion.title})`
                );
                return emptyFn.bind(null, assertionProxy);
            }
            else {
                keys = Object.keys(test_assertions);
                if (keys.indexOf(propName) !== -1) {
                    return wrapAssertion.bind(
                        null
                        , assertionProxy
                        , assertion
                        , propName
                    );
                }
                else {
                    keys = Object.keys(test_conversions);
                    if (keys.indexOf(propName) !== -1) {
                        return wrapConversion.bind(
                            null
                            , assertionProxy
                            , assertion
                            , propName
                        );
                    }
                }
            }
        }
        //made it here invalid property
        assertion.passed = false;
        assertion.exception = new Error(
            `${errors.test.client.invalid_testhead_property} (${propName})`
        );
        //return the proxy for chaining
        //wrapped in the emptyFn since the `get` (we are handling now) is being executed once the `get` finished
        return emptyFn.bind(null, assertionProxy);
    }
    /**
    * @function
    */
    function setValue(assertionProxy, assertion, value, path) {
        if (!!assertion.hasOwnProperty("value")) {
            throw new Error(
                `${errors.test.client.assertion_value_set}`
            );
        }
        //if there is a path then value should be an object
        if (!!path) {
            if (!is_objectValue(value) && !is_array(value)) {
                throw new Error(
                    `${errors.test.client.nonobject_value_path}`
                );
            }
            assertion.value = utils_lookup(
                path
                , value
            );
        }
        else {
            assertion.value = value;
        }
        //return the proxy for chaining
        return assertionProxy;
    }
    /**
    * @function
    */
    function wrapConversion(assertionProxy, assertion, propName, ...args) {
        try {
            var conversionFunc = test_conversions[
                propName
            ]
            , convArgs =
                [assertion.value]
                .concat(args)
            , newValue = conversionFunc.apply(
                null
                , convArgs
            );

            if (is_array(newValue)) {
                if(is_error(newValue[1])) {
                    assertion.passed = false;
                    assertion.exception = newValue[1];
                }
                else {
                    assertion.value = newValue[0];
                }
            }
            else {
                assertion.value = newValue;
            }
        }
        catch(ex) {
            assertion.passed = false;
            assertion.exception = ex;
        }
        //return the proxy for chaining
        return assertionProxy;
    }
    /**
    * @function
    */
    function wrapAssertion(assertionProxy, assertion, propName, ...args) {
        try {
            var assertionFunc = test_assertions[
                propName
            ]
            , assertArgs =
                [assertion.value]
                .concat(args)
            , result = assertionFunc.apply(
                null
                , assertArgs
            )
            , assertionPass
            ;
            if (!is_array(result)) {
                result = [result];
            }
            //the first results member is the passed value
            assertionPass = !!result[0];
            if (assertion.not) {
                assertionPass = !assertionPass;
            }
            assertion.passed = assertion.passed
                && assertionPass
            ;
            //add the assertion name to the result
            result.unshift(propName);
            //add the assertion to the results
            assertion.results.push(
                result
            );
        }
        catch(ex) {
            assertion.passed = false;
            assertion.exception = ex;
        }
        //return the proxy for chaining
        return assertionProxy;
    }
    /**
    * @function
    */
    function emptyFn(assertionProxy) {
        return assertionProxy;
    }
}