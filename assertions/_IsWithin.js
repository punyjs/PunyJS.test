/**
* This facory produces a worker that tests if a value is between 2 other values,
* including the high and low values themselves.
* @factory
*/
function _IsWithin(

) {

    return IsWithin;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value The value under test
    * @param {any} low The low end of the range
    * @param {any} high The high end of the range
    * @returns {boolean}
    */
    function IsWithin(value, low, high) {
        return value >= low
            && value <= high
        ;
    }
}