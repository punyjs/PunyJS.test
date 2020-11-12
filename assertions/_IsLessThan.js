/**
* This factory produces a worker function that tests if one value is less than
* another.
* @factory
*/
function _IsLessThan(

) {

    return IsLessThan;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value1 The operand on the less hand side
    * @param {any} value2 The operand on the greater hand side
    * @returns {boolean}
    */
    function IsLessThan(value1, value2) {
        return value1 < value2;
    }
}