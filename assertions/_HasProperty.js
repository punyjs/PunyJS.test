/**
* This factory produces a worker function checks an object's key for a specific
* name
* @factory
*/
function _HasProperty(
    is_object
    , is_array
    , is_func
) {

    /**
    * @worker
    * @type {assertion}
    * @param {object} value The object to check
    * @param {string} name The property name to check for
    * @return {boolean}
    */
    return function HasProperty(value, name) {
        if (!is_object(value) && !is_array(value) && !is_func(value)) {
            return [
                false
                , [
                    errors.test.client.assertions.value_mustbe_object
                    , name
                ]
            ];
        }

        var keys = Object.keys(value);

        return [
            keys.indexOf(name) !== -1
            , [
                keys
                , name
            ]
        ];
    }
}