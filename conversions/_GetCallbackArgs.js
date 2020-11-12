/**
* This factory produces a worker function that returns an array of arguments
* sent to a callback
* @factory
*/
function _GetCallbackArgs(
    is_mockCallback
    , errors
) {


    return GetCallbackArgs;

    /**
    * @worker
    * @type {converter}
    * @param {object} cb The callback
    * @param {number} num The index of the callback instance
    * @returns {array}
    */
    function GetCallbackArgs(cb, num) {
        //they could have called this without a call number, so set it to 0
        if (isNill(num)) {
            num = 0;
        }

        if (!is_mockCallback(cb)) {
            return [
                null
                , `${errors.test.client.conversions.not_callback}: GetCallbackArg`
            ];
        }

        //check the callback count
        if (num >= cb.callbackCount) {
            return [
                null
                , `${errors.test.client.conversions.callback_not_enough}: GetCallbackArg ${num}/${cb.callbackCount}`
            ];
        }

        //get he args for this call
        var cbArgs = cb.getArgs(num);

        return cbArgs;
    }
}