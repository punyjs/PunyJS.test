/**
* This factory produces a worker function that tests a value to see if it equals
* the literal value true.
* @factory
*/
function _IsTrue(

) {

    return IsTrue;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value The value to test for true
    * @returns {boolean}
    */
    function IsTrue(value) {
        return value === true;
    }
}