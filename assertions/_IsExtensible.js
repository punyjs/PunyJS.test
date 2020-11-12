/**
* This factory produces a worker function that tests if an object is extensible
* @factory
*/
function _IsExtensible(
    is_object
) {

    return IsExtensible;

    /**
    * @worker
    * @type {assertion}
    * @param {all} value1 On of the values to be tested
    * @param {all} value2 On of the values to be tested. Can be a getValue wrapper
    * @returns {boolean}
    */
    function IsExtensible(value) {
        return is_object(value)
            && Object.isExtensible(value)
            || false
        ;
    }
}