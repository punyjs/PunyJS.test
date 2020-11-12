/**
* This factory produces a worker function that tests if a callback was called
* with a certain argument value.
* @factory
*/
function _HasBeenCalledWithArg(
    is_mockCallback
    , errors
) {


    return HasBeenCalledWithArg;

    /**
    * @worker
    * @type {assertion}
    * @param {callback} cb The callback object to be tested
    * @param {number} num The index of the callback instance
    * @param {number} index The index of the arguments array
    * @param {any} arg The argument value that is expected
    * @return {boolean}
    */
    function HasBeenCalledWithArg(cb, num, index, arg) {
        //they could have called this without a call number, so set it to 0
        if (arg === undefined) {
            arg = index;
            index = num;
            num = 0;
        }

        if (!cb) {
            return [
                false
                , [
                    errors.test.client.assertions.not_callback
                ]
                , arg
            ];
        }

        if (!is_mockCallback(cb)) {
            return [
                false
                , [
                    errors.test.client.assertions.not_callback
                ]
                , arg
            ];
        }

        //check the callback count
        if (num >= cb.callbackCount) {
            return [
                false, [
                    `${errors.test.client.assertions.callback_not_enough} ${num + 1}`
                ]
                , arg
            ];
        }

        //get he args for this call
        var cbArgs = cb.getArgs(num);

        //see if there is an arg at position
        if (cbArgs.length <= index) {
            return [
                false
                , [
                    `${errors.test.client.assertions.callback_not_enough_args} ${index + 1}`
                    , arg
                ]
            ];
        }

        return [
            cbArgs[index] === arg
            , [
                cbArgs[index]
                , arg
            ]
        ];
    }
}