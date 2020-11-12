/**
* @factory
*/
function _InitBrowser(
    promise
    , url
    , initClient
) {

    /**
    * @worker
    */
    return function InitBrowser(href) {
        try {
            var urlObj = new url(href)
            , args = getArguments(
                urlObj.searchParams
            );
            args.environment = "browser";
            if (!args.hostname) {
                args.hostname = urlObj.hostname;
                //we can use the same port since you could support both http and http2 protocols with the same port
                if (!args.port) {
                    args.port = urlObj.port;
                }
            }
            //execute the endpoint init, it returns a promise, pass that through
            return initClient(
                args
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    };

    /**
    * Iterates through the search params and add each to the args object
    * @function
    */
    function getArguments(searchParams) {
        var args = {};

        Array.from(searchParams.keys())
        .forEach(function forEachSearchParamKey(key) {
            args[key] = searchParams.get(key);
        });

        return args;
    }
}