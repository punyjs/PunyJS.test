/**
*
* @factory
*/
function _TestResultRecorder(
    promise
    , utils_reference
    , recorders
    , errors
) {

    return TestResultRecorder;

    /**
    * @worker
    */
    function TestResultRecorder(config, testResults) {
        try {
            var recorderKey = config.recorder
            , ref = utils_reference(
                recorderKey
                , recorders
            )
            , recorder
            ;
            if (!ref.found) {
                throw new Error(
                    `${errors.test.runner.missing_recorder} (${recorderKey})`
                );
            }

            recorder = ref.value;

            return recorder(
                config
                , testResults
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
}