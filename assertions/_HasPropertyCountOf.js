/**
* This factory produces a worker function that tests the number of properties
* that an object has.
* @factory
*/
function _HasPropertyCountOf(
    is_object
    , is_array
    , is_func
) {

    /**
    * @worker
    * @type {assertion}
    * @param {object} value The object to get the propert count for
    * @param {number} cnt The expected count of properties
    * @return {boolean}
    */
    return function HasPropertyCountOf(value, cnt) {
        if (!is_object(value) && !is_array(value) && !is_func(value)) {
            return [
                false
                , [
                    errors.test.client.assertions.value_mustbe_object
                    , cnt
                ]
            ];
        }

        var propCnt = Object.keys(value).length;

        return [
            propCnt === cnt
            , [
                propCnt
                , cnt
            ]
        ];
    }
}