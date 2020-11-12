/**
* This factory produces a worker function that tests if a callback has been
* called either a specific number of times, or if it was called at all.
* @factory
*/
function _HasBeenCalled(
    is_mockCallback
    , is_nill
    , errors
) {

    return HasBeenCalled;

    /**
    * @worker
    * @type {assertion}
    * @param {callback} cb The callback object to be tested
    * @param {number} [cnt] The expected callback count
    * @return {boolean}
    */
    function HasBeenCalled(cb, cnt) {
        if (!cb) {
            return [
                false
                , [
                    errors.test.client.assertions.not_callback
                ]
                , cnt
            ];
        }
        if (!is_mockCallback(cb)) {
            return [
                false
                , [
                    errors.test.client.assertions.not_callback
                    , cnt
                ]
            ];
        }
        if (is_nill(cnt)) {
            return [
                cb.callbackCount > 0
                , [
                    cb.callbackCount
                ]
            ];
        }
        else {
            return [
                cb.callbackCount === cnt
                , [
                    cb.callbackCount
                    , cnt
                ]
            ];
        }
    }
}