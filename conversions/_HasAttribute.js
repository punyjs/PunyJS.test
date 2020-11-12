/**
*
* @factory
*/
function _HasAttribute(
    is_element
    , errors
) {


    return HasAttribute;

    /**
    * @worker
    * @type {converter}
    * @param {Element} el The Element to get the attribute from
    * @param {String} name The name of the attribute to get
    * @returns {array}
    */
    function HasAttribute(el, name) {
        return is_element(el)
            ? el.hasAttribute(name)
            : [
                null
                , `${errors.test.client.conversions.element_required} HasAttribute`
            ]
        ;
    }
}