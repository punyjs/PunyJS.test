/**
* This factory produces a worker function that tests if an object is sealed
* @factory
*/
function _IsSealed(

) {

    return IsSealed;

    /**
    * @worker
    * @type {assertion}
    * @param {all} value1 On of the values to be tested
    * @param {all} value2 On of the values to be tested. Can be a getValue wrapper
    * @returns {boolean}
    */
    function IsSealed(value) {
        return isObject(value) && Object.isSealed(value) || false;
    }
}