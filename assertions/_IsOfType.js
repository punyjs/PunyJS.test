/**
* This factory produces a worker function that tests a value for a specific type
* @factory
*/
function _IsOfType(

) {

    return IsOfType;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value The value to get the type from
    * @param {string} type The type name to check against the value's type
    * @returns {boolean}
    */
    function IsOfType(value, type) {
        return getType(value) === type;
    }
}