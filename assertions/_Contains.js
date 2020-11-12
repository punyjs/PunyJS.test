/**
* This factory produces a worker function that tests if a value is contained
* within another value. This works for object keys, array members, and strings
* @factory
*/
function _Contains(

) {

    return Contains;

    /**
    * @worker
    * @type {assertion}
    * @param {all} value1 On of the values to be tested
    * @param {all} value2 On of the values to be tested. Can be a getValue wrapper
    * @return {boolean}
    */
    function Contains(value1, value2) {

        return typeof (value1) === 'object'
            && Object.keys(value1).indexOf(value2) !== -1
            || value1.indexOf(value2) !== -1;
    }
}