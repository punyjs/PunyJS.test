/**
* This factory produces a worker function that tests a value to see if it equals
* the literal value null.
* @factory
*/
function _IsNull(

) {

    return IsNull;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value The value to test
    * @returns {boolean}
    */
    function IsNull(value) {
        return value === null;
    }
}