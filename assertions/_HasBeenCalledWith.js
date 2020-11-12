/**
* The factory provides a worker function that checks if the value is a callback,
* then checks to see if the callback was called with the arguments passed
* @factory
*/
function _HasBeenCalledWith(
    is_mockCallback
    , is_array
    , errors
) {

    return HasBeenCalledWith;

    /**
    * @worker
    * @type {assertion}
    * @param {callback} cb The callback object to be tested
    * @param {number} num The index of the callback instance
    * @param {array} args The args array that is expected
    * @param {number} num The index of the callback instance
    * @return {boolean}
    */
    function HasBeenCalledWith(cb, num, args) {
        //they could have called this without a call number, so set it to 0
        if (!args && is_array(num)) {
            args = num;
            num = 0;
        }

        if (!cb) {
            return [
                false
                , [
                    errors.test.client.assertions.not_callback
                ]
                , args
            ];
        }

        if (!is_mockCallback(cb)) {
            return [
                false
                , [
                    errors.test.client.assertions.not_callback
                    , args
                ]
            ];
        }

        //check the callback count
        if (num >= cb.callbackCount) {
            return [
                false
                , [
                    `${errors.test.client.assertions.callback_not_enough} ${num}/${cb.callbackCount}`
                    , args
                ]
            ];
        }

        //get he args for this call
        var cbArgs = cb.getArgs(num);

        //check the args count against the callback arg count
        if (cbArgs.length !== args.length) {
            return false;
        }

        //check each arg
        return [
            cbArgs.filter(function (arg, index) {
                return args[index] !== arg;
            }).length === 0
            , [
                cbArgs
                , args
            ]
        ];
    }
}