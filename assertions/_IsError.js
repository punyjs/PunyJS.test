/**
* This factory produces a worker function that check to see if a value is an
* Error type.
* @factory
*/
function _IsError(
    is_error
) {


    return IsError;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value The value to test for error
    * @returns {boolean}
    */
    function IsError(value) {
        return is_error(value);
    }
}