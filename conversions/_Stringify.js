/**
* This factory produces a worker function that runs the JSON.stringify method
* on the value, except if the value is falsy.
* @factory
*/
function _Stringify(
    utils_stringify
) {

    return Stringify;

    /**
    * @worker
    * @type {converter}
    * @param {any} value The value to stringify
    * @returns {string}
    */
    function Stringify(value) {
        return !!value
            && utils_stringify(value)
            || value
        ;
    }
}