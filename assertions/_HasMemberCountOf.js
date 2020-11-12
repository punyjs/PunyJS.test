/**
* This factory produces a worker function that tests the length of an array.
* @factory
*/
function _HasMemberCountOf(
    is_array
) {


    return HasMemberCountOf;

    /**
    * @worker
    * @type {assertion}
    * @param {array} value The array to get the length for
    * @param {number} length The expected array length
    * @return {boolean}
    */
    function HasMemberCountOf(value, length) {
        if (!is_array(value)) {
            return [
                false
                , [
                    errors.test.client.assertions.value_mustbe_array
                    , length
                ]
            ];
        }
        return [value.length === length,[value.length, length]];
    }
}