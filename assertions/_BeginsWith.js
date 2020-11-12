/**
* This factory produces a worker function that tests if a value begins with
* value
* @factory
*/
function _BeginsWith(

) {


    return BeginsWith;

    /**
    * @worker
    * @type {assertion}
    * @param {string} value1 One of the values to be tested
    * @param {string} value2 One of the values to be tested. Can be a getValue wrapper
    * @return {boolean}
    */
    function BeginsWith(value1, value2) {

        return value1.indexOf(value2) === 0;
    }
}