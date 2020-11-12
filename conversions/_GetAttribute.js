/**
*
* @factory
*/
function _GetAttribute(
    is_element
    , errors
) {


    return GetAttribute;

    /**
    * @worker
    * @type {converter}
    * @param {Element} el The Element to get the attribute from
    * @param {String} name The name of the attribute to get
    * @returns {array}
    */
    function GetAttribute(el, name) {
        return is_element(el)
            ? el.getAttribute(name)
            : [,errors.test.client.conversions.element_required]
        ;
    }
}