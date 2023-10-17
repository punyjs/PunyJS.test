/**
* This factory produces a worker function that returns an array of object keys
* if the value is an object. Otherwise returns "not an object".
* @factory
*/
function _GetPropertyValue(
    errors
) {


    return GetPropertyValue;

    /**
    * @worker
    *   @type {converter}
    *   @param {object} value The object to that holds the property
    *   @param {string} name The name of the property to retrieve
    *   @returns {mixed}
    */
    function GetPropertyValue(value, name) {
        return typeof value === "object"
            && [
                value[name]
            ]
            || [
                null
                , `${errors.test.client.conversions.not_object} GetKeys`
            ]
    }
}