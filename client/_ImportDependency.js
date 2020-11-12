/**
* The ImportDependency utility intakes browser or server side JavaScript as text, searches for any static export/import statements and replaces them with their mocked, dynamic, couter part. This allows the JavaScript to be executed in an environment agnostic environment.
* @factory
*/
function _ImportDependency(
    promise
    , is_object
    , utils_asyncFunction
    , utils_reference
    , reporter
    , defaults
    , errors
) {
    /**
    * A regular expression pattern for replacing the slashes in the dependecy path
    * @property
    */
    var SLSH_PATT = /[\\\/]/g
    /**
    * A regular expression pattern for replacing brackets
    * @property
    */
    , BRKT_PATT = /[\{\}]/g
    /**
    * A regular expression pattern to replace underscores
    * @property
    */
    , LD_PATT = /[_]/g
    /**
    * A regular expression pattern to replace ES6 export syntax
    * @property
    */
    , STATIC_EXPORT_PATT = /((?:^|(?:\n))[ \t]*)export[\s]+([A-z0-9_$* {},]+)[\s]+([^;]+);/gs
    /**
    * A regular expression pattern to replace ES6 export default syntax
    * @property
    */
    , NODE_EXPORT_PATT = /(?:^|(?:\n))[ \t]*module.exports/gs
    /**
    * A regular expression pattern to replace ES6 import name syntax
    * @property
    */
    , STATIC_IMPORT_PATT = /(?:^|\n)[ \t]*import[\s]+([A-z0-9_$* {},]+)[\s]+from[\s]+([A-z0-9_$"'/\\.]+)[\s]*;/g
    /**
    * A regular expression pattern for replacing dynamic import statements
    * @property
    */
    , DYNAMIC_IMPORT_PATT = /(?:^|[^a-zA-Z0-9_$])(?![$])import[\s]*\(([^\)]+)\)/g
    /**
    * A regular expression pattern for replacing static require statments
    * @property
    */
    , NODE_REQUIRE_PATT = /(?:^|[^a-zA-Z0-9_$])require[\s]*\(([^\)]+)\)/g
    ;

    return ImportDependency;

    /**
    * @worker
    *   @async
    */
    function ImportDependency(unitItems, dependencyPath, mocks) {
        try {
            //convert the path to a namespace
            var dependencyName =
                dependencyPath.replace(SLSH_PATT, ".")
            //get the dependency from the list of test items
            , dependency = resolveDependency(
                unitItems
                , dependencyName
            )
            , moduleCode = !!dependency
                && dependency.data
                || ""
            //replace import/export static statements
            , dynamicModuleCode = updateCode(
                moduleCode
            )
            //the target of export statements
            , mockExports = {
                "exports": {}
            }
            //create the function parameter names for the IIFE
            , paramNamesBody =
                [
                    "$module$"
                    , "$import$"
                ]
                //add the hide globals array to the list of parameters will re-declare the global variables that we wish to hide
                .concat(
                    defaults.test.client.hideGlobals
                )
                //add our modified code as the final argument, the func body
                .concat(
                    dynamicModuleCode
                )
            , moduleFuncAsync
            ;
            //if the module code is falsey then we failed to find the dependency
            if (!moduleCode) {
                throw new Error(
                    `${errors.import_path_not_found} (${dependencyPath})`
                );
            }
            //create the IIFE with the parameter names and body
            moduleFuncAsync = utils_asyncFunction.apply(
                null
                , paramNamesBody
            );
            //execute the dependency, any exports will go on the mockExports object
            return moduleFuncAsync.apply(
                null
                , [
                    mockExports
                    , mockImport.bind(null, unitItems, mocks)
                ]
            )
            .then(function thenResolveExports() {
                if (Object.keys(mockExports.exports).length === 1) {
                    if (!!mockExports.exports.default) {
                        return promise.resolve(
                            mockExports.exports.default
                        );
                    }
                }
                return promise.resolve(
                    mockExports.exports
                );
            })
            .catch(function catchErrors(error) {
                reporter.error(
                    error
                );
                return promise.resolve(error);
            });
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * Attempts to convert the
    * @function
    */
    function updateCode(data) {
        return updateStaticImport(
            updateDynamicImport(
                updateRequireImport(
                    updateStaticExport(
                        updateModuleExports(
                            data
                        )
                    )
                )
            )
        );
    }
    /**
    * Attempt to find module.exports and converts them to use the $$exports mock object
    * @function
    */
    function updateModuleExports(data) {
        return data.replace(
            NODE_EXPORT_PATT
            , function replaceNodeExport(match) {
                return match.replace(
                    "module.exports"
                    , "$module$.exports.default"
                );
            }
        );
    }
    /**
    * Attempts to find static export statements, and converts them to use the $exports mock object
    * @function
    */
    function updateStaticExport(data) {
        return data.replace(
            STATIC_EXPORT_PATT
            , function replaceNames(match, whitespace, names, defaultValue) {
                var update = [];
                names.split(",")
                .forEach(function forEachName(nameText) {
                    var parts = nameText
                        .replace(BRKT_PATT, "")
                        .split("as")
                    , name = parts[0].trim()
                    , value = parts[1] || name
                    ;
                    if (name === "default") {
                        value = defaultValue;
                    }
                    update.push(
                        `${whitespace}$module$.exports["${name}"] = ${value};`
                    );
                });
                return update
                    .join("\n");
            }
        );
    }
    /**
    * Attempts to find syncronous static import statements, and replaces them with our mocked async $import function
    * @function
    */
    function updateStaticImport(data) {
        return data.replace(
            STATIC_IMPORT_PATT
            , function replaceImport(match, names, path) {
                //get the variable and name assignments from the export statement and add them to the desctructuring statement
                //const { default: myDefault, foo, bar } = await import('path')
                var statement = "const {";
                names.split(",")
                .forEach(function forEachName(nameText, indx) {
                    var isDefault = indx === 0 && names.indexOf("{") > 0
                    , parts = nameText
                        .replace(BRKT_PATT, "")
                        .split("as")
                    , moduleName = parts[0].trim()
                    , localName = !!parts[1]
                        && parts[1].trim()
                        || name
                    ;
                    if (isDefault) {
                        statement+= `default:${localName},`;
                    }
                    else {
                        statement+= `${localName},`
                    }
                });
                //remove trailing comma
                statement = statement.substring(0, statement.length - 2);
                //finish the destructuring statement
                statement+= "}=await import(${path});";
                return statement;
            }
        );
    }
    /**
    * Attempts to find dynamic import calls and replaces the 'import' with our mocked async $import
    * @function
    */
    function updateDynamicImport(data) {
        return data.replace(
            DYNAMIC_IMPORT_PATT
            , function replaceDynamicImport(match) {
                return match.replace("import", "$import$");
            }
        );
    }
    /**
    * Attempts to find syncronous require calls and replaces the 'require' with our mocked async $import function
    * @function
    */
    function updateRequireImport(data) {
        return data.replace(
            NODE_REQUIRE_PATT
            , function replaceRequire(match) {
                return match.replace("require", "$import$");
            }
        );
    }
    /**
    * @function
    */
    function mockImport(unitItems, mocks, path) {
        try {
            var name = path.replace(SLSH_PATT, ".")
            , ref;
            //if there are mocks then lookup there first
            if(is_object(mocks)) {
                ref = utils_reference(
                    name
                    , mocks
                );
            }
            //if not found in the mocks then lookup in the units
            if(!ref || !ref.found) {
                ref = utils_reference(
                    name
                    , unitItems
                );
            }

            if(!ref.found) {
                throw new Error(
                    `${errors.test.client.import_path_not_found} (${path})`
                )
            }
            return promise.resolve(ref.value);
        }
        catch(ex) {
            return promise.resolve(ex);
        }
    }
    /**
    * Attempts to find static import statements, and replace them with async dynamic function calls
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
                `${errors.test.client.import_path_not_found} (${path})`
            );
        }
        return ref.value;
    }
}