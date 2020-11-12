/**
* This factory produces a worker function that runs a value's toString method.
* @factory
*/
function _ToString(

) {

    return ToString;

    /**
    * @worker
    * @type {converter}
    * @param {any} value The value to convert to a string
    * @returns {string}
    */
    function ToString(value) {
        if (!!value && !!value.toString) {
            return value.toString();
        }
        return typeof value;
    }
}