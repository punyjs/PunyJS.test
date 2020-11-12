/**
* This factory produces a worker function that checks an array's values for
* uniqueness.
* @factory
*/
function _IsUnique(
    
) {

    return IsUnique;

    /**
    * @worker
    * @type {assertion}
    * @param {array} value The array to test for uniqueness
    * @returns {boolean}
    */
    function IsUnique(value) {
        var temp = [], i, val;
        //loop through the array
        for (i = 0; i < value.length; i++) {
            val = value[i];
            if (temp.indexOf(val) > -1) {
                return false;
            }
            temp.push(val);
        }
        return true;
    }
}