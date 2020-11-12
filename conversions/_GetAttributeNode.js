/**
*
* @factory
*/
function _GetAttributeNode(
    is_element
    , errors
) {


    return GetAttributeNode;

    /**
    * @worker
    * @type {converter}
    * @param {Element} el The Element to get the attribute from
    * @param {String} name The name of the attribute to get
    * @returns {array}
    */
    function GetAttributeNode(el, name) {
        return is_element(el)
            ? el.getAttributeNode(name)
            : [,errors.test.client.conversions.element_required]
        ;
    }
}