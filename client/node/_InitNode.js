/**
* @factory
*/
function _InitNode(
    promise
    , initClient
) {

    /**
    * @worker
    */
    return function InitNode(cmdArgs) {
        try {
            var args = cmdArgs.arguments;
            args.environment = "node";
            return initClient(
                args
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    };
}