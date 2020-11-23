/**
* This factory produces a worker function that tests a value to see if it equals
* the literal value null or the literal value undefined.
* @factory
*/
function _IsNill(
    is_nill
) {

    return IsNill;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value The value to test
    * @returns {boolean}
    */
    function IsNill(value) {
        return is_nill(value);
    }
}