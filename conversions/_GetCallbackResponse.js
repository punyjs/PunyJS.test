/**
* This factory produces a worker function that returns a member from the
* arguments sent to a callback
* @factory
*/
function _GetCallbackResp(
    is_mockCallback
    , is_nill
    , errors
) {


    return GetCallbackResponse;

    /**
    * @worker
    * @type {converter}
    * @param {object} cb The callback
    * @param {number} num The index of the callback instance
    * @returns {array}
    */
    function GetCallbackResponse(cb, num) {
        //they could have called this without a call number, so set it to 0
        if (is_nill(num)) {
            num = 0;
        }

        if (!is_mockCallback(cb)) {
            return [
                null
                , `${errors.test.client.conversions.not_callback}: GetCallbackResponse`
            ];
        }

        //check the callback count
        if (num >= cb.callbackCount) {
            return [
                null
                , `${errors.test.client.conversions.callback_not_enough}: GetCallbackResponse ${num}/${cb.callbackCount}`
            ];
        }

        //get he args for this call
        var cbResp = cb.getResponse(num);

        return cbResp;
    }
}