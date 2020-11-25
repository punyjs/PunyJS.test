/**
* The has own property assertion checks an object for a name in it's own property name list
* @factory
*/
function _HasOwnProperty(
    is_object
    , is_array
    , is_func
    , errors
) {

    /**
    * @worker
    * @type {assertion}
    * @param {object} value The object to check
    * @param {string} name The property name to check for
    * @return {boolean}
    */
    return function HasOwnProperty(value, name) {
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