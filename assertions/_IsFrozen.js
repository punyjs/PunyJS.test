/**
* This factory produces a worker function that tests if an object is frozen
* @factory
*/
function _IsFrozen(

) {


    return IsFrozen;

    /**
    * @worker
    * @type {assertion}
    * @param {all} value1 On of the values to be tested
    * @param {all} value2 On of the values to be tested. Can be a getValue wrapper
    * @returns {boolean}
    */
    function IsFrozen(value) {
        return isObject(value)
            && Object.isFrozen(value)
            || false
        ;
    }
}