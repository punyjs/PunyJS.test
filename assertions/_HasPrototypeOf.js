/**
* The has prototype assertion checks
* @factory
*/
function _HasPrototypeOf(

) {


    return HasPrototypeOf;

    /**
    * @worker
    * @type {assertion}
    * @param {any} value The value to check the prototype of
    * @param {any} proto The prototype to check against
    * @returns {boolean}
    */
    function HasPrototypeOf(value, proto) {
        var valueProto = Object.getPrototypeOf(value);

        return [valueProto === proto];
    }
}