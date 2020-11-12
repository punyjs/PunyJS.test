/**
* This factory produces a worker function that tests the response of a callback
* instance.
* @factory
*/
function _HasResponseOf(
    is_mockCallback
    , errors
) {


    return HasResponseOf;

    /**
    * @worker
    * @type {assertion}
    * @param {callback} cb The callback object to be tested.
    * @param {number} num The callback instance index.
    * @param {any} response The value expected to be the response
    * @return {boolean}
    */
    function HasResponseOf(cb, num, response) {
        //they could have called this without a call number, so set it to 0
        if (response === undefined) {
            response = num;
            num = 0;
        }

        if (!is_mockCallback(cb)) {
            return [
                false
                , [
                    error.test.client.assertions.not_callback
                    , response
                ]
            ];
        }

        var cbResp = cb.getResponse(num);

        return [cbResp === response, [cbResp, response]];
    }
}