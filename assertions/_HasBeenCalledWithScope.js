/**
* This factory produces a worker function that tests the scope that a callback
* instance was called with.
* @factory
*/
function _HasBeenCalledWithScope(
    is_mockCallback
    , errors
) {


    return HasBeenCalledWithScope;

    /**
    * @worker
    * @type {assertion}
    * @param {callback} cb The callback object to be tested
    * @param {number} num The index of the callback instance
    * @param {object} scope The expected scope for the callback instance
    * @return {boolean}
    */
    function HasBeenCalledWithScope(cb, num, scope) {
        //they could have called this without a call number, so set it to 0
        if (scope === undefined) {
                scope = num;
                num = 0;
        }

        if (!cb) {
                return [
                    false
                    , [
                        errors.test.client.assertions.not_callback
                    ]
                    , scope
                ];
        }

        if (!is_mockCallback(cb)) {
            return [
                false
                , [
                    errors.test.client.assertions.not_callback
                    , scope
                ]
            ];
        }

        //check the callback count
        if (num >= cb.callbackCount) {
            return [
                false
                , [
                    `${errors.test.client.assertions.callback_not_enough} ${num + 1}`
                    , scope
                ]
            ];
        }

        var cbScope = cb.getScope(num);

        return [cbScope === scope, [cbScope, scope]];
    }
}