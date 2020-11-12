/**
* This factory produces a worker function that tests to see if one value is
* greater than onther value.
* @factory
*/
function _IsGreaterThan(
    
) {


    return IsGreaterThan;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value1 The operand on the greater hand side
    * @param {any} value2 The operand on the less hand side
    * @returns {boolean}
    */
    function IsGreaterThan(value1, value2) {
        return value1 > value2;
    }
}