/**
* This factory produces a worker function that returns an array of object keys
* if the value is an object. Otherwise returns "not an object".
* @factory
*/
function _GetPropertyNames(
    errors
) {


    return GetPropertyNames;

    /**
    * @worker
    *   @type {converter}
    *   @param {object} value The object to get the properties from
    *   @returns {mixed}
    */
    function GetPropertyNames(value) {
        return typeof value === "object"
            && Object.keys(value)
            || [
                null
                , `${errors.test.client.conversions.not_object} GetKeys`
            ]
    }
}