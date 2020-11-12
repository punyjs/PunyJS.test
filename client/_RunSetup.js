/**
* @factory
*/
function _RunSetup(
    promise
    , utils_function
    , utils_reference
    , utils_ensure
    , is_promise
    , globalRedeclarationList
    , errors
) {

    /**
    * A regular expression pattern to replace underscores
    * @property
    */
    var LD_PATT = /[_]/g
    ;

    return RunSetup;

    /**
    * @worker
    */
    function RunSetup(entry, setupDeps) {
        try {
            //hydrate the entry if the value doesn't already exist
            if (!entry.hasOwnProperty("value")) {
                entry.value = hydrateEntry(
                    entry
                    , setupDeps.$client.environment
                );
                Object.freeze(entry);
            }

            var factoryFunc = entry.value
            , factoryDeps = entry.dependencies
            , funcDeps = resolveDependencies(
                entry
                , setupDeps
                , factoryDeps
            )
            //the path is the name with any underscores turned to dots
            , path = entry.name.replace(LD_PATT, ".")
            //lookup the path in the dependencies collection
            , ref = utils_reference(
                path
                , setupDeps
            )
            , result
            ;
            if (ref.found) {
                throw new Error(
                    `${errors.test.client.setup_name_exists} (${path})`
                );
            }
            //ensure the path exists in the collection
            utils_ensure(
                path
                , setupDeps
            );
            //get the reference to the new path
            ref = utils_reference(
                path
                , setupDeps
            );
            //execute the function and record the results
            result = factoryFunc.apply(
                null
                , funcDeps
            );
            //if the result is a promise then wait for it to resolve
            if (is_promise(result)) {
                return result
                .then(function thenRecordResult(value) {
                    ref.parent[ref.index] = value;
                    return promise.resolve();
                });
            }

            ref.parent[ref.index] = result;

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
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
    function hydrateEntry(entry, environment) {
        //create the function body
        var entryText = `"use strict";\nreturn ${entry.data};`
        //create the list of arguments used to create the hydrate function
        , entryFuncArgs =
            globalRedeclarationList[
                environment
            ]
            .concat(
                entryText
            )
        //create the hydrate function
        , entryFunc = utils_function.apply(
            null
            , entryFuncArgs
        );
        //execute the hydrate function and return the result
        return entryFunc();
    }
}