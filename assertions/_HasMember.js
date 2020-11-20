/**
* This factory produces a worker function that checks that a value exists in an
* array.
* @factory
*/
function _HasMember(
    is_array
    , errors
) {


    return HasMember;

    /**
    * @worker
    * @type {assertion}
    * @param {array} value The array to test for the member
    * @param {any} member The value expected to be in the array
    * @return {boolean}
    */
    function HasMember(value, member) {
        if (!is_array(value)) {
            return [
                false
                , [
                    errors.test.client.assertions.value_mustbe_array
                    , member
                ]
            ];
        }
        return [
            value.indexOf(member) !== -1
            , [
                value
                , member
            ]
        ];
    }
}