/**
* This factory produces a worker function that returns a member from the
* arguments sent to a callback
* @factory
*/
function _GetCallbackArg(
    is_mockCallback
    , is_nill
    , errors
) {

    return GetCallbackArg;

    /**
    * @worker
    * @type {converter}
    * @param {object} cb The callback
    * @param {number} num The index of the callback instance
    * @param {number} index The index of the callback argument
    * @returns {array}
    */
    function GetCallbackArg(cb, num, index) {
        //they could have called this without a call number, so set it to 0
        if (is_nill(num)) {
            num = 0;
        }
        if (is_nill(index)) {
            index = 0;
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
        var cbArg = cb.getArgs(num)[index];

        return [cbArg, [num, index]];
    }
}