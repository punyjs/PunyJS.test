/**
* Sends the test entry over the wire, implmenting some communication protocol
* @factory
*/
function _TestMessageSender(
    promise
    , clientController
    , is_object
    , is_empty
) {

    return TestMessageSender

    /**
    * @worker
    */
    function TestMessageSender(clientIds, instruction, data) {
         if (is_empty(clientIds)) {
             return promise.resolve();
         }
         try {
             var message = instruction
             , success;
             if (!!data) {
                 if (is_object(data)) {
                     data = JSON.stringify(data);
                 }
                 message = `${message}:${data}`;
             }
             //send the instruction to the clients
             return clientController.sendMessage(
                 message
                 , clientIds
             );
         }
         catch(ex) {
             return promise.reject(ex);
         }
    }
}