/**
* This factory produces a worker function that tests if a value ends with a
* value
* @factory
*/
function _EndsWith(

) {


    return EndsWith;

    /**
    * @worker
    * @type {assertion}
    * @param {string} value1 One of the values to be tested
    * @param {string} value2 One of the values to be tested. Can be a getValue wrapper
    * @return {boolean}
    */
    function EndsWith(value1, value2) {

        var patt = new RegExp(".*?" + value2 + "$");

        return patt.test(value1);
    }
}