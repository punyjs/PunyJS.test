/**
* @factory
*/
function _RunnerLoop(
    promise
    , setTimeout
    , runner
    , testResultRecorder
    , reporter
) {


    return RunnerLoop;

    /**
    * @worker
    */
    function RunnerLoop(config, control) {
        return new promise(
            loop.bind(null, config, control)
        );
    };

    /**
    * @function
    */
    function loop(config, control, resolve, reject) {
        try {
            //check the loop control
            if (control.stop === true) {
                resolve();
            }
            //check the run control
            else if (control.run === true) {
                control.run = false;
                runTest(
                    config
                    , control
                    , resolve
                    , reject
                );
            }
            //otherwise set the next loop
            else {
                setTimeout(
                    loop
                    , config.loopInterval
                    , config
                    , control
                    , resolve
                    , reject
                );
            }
        }
        catch(ex) {
            reject(ex);
        }
    }
    /**
    * @function
    */
    function runTest(config, control, loopResolve, loopReject) {
        //run the test runner
        return runner(
            config
        )
        //record the results
        .then(function thenRecordTestPackage(testPackage) {
            return testResultRecorder(
                config
                , testPackage
            );
        })
        //report any errors
        .catch(function catchError(err) {
            reporter.error(err);
        })
        //last thing, continue iterating
        .finally(function finallyRunLoop() {
            setTimeout(
                loop
                , config.loopInterval
                , config
                , control
                , loopResolve
                , loopReject
            );
        });
    }
}