/**
* This factory produces a worker function that performs a non-strict equality
* between two values.
* @factory
*/
function _IsAlmost(

) {

    return IsAlmost;

    /**
    * @worker
    * @type {assertion}
    * @param {all} value1 On of the values to be tested
    * @param {all} value2 On of the values to be tested. Can be a getValue wrapper
    * @returns {boolean}
    */
    function IsAlmost(value1, value2) {
        return value1 == value2;
    }
}