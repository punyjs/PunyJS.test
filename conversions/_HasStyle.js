/**
*
* @factory
*/
function _HasStyle(
    is_element
    , errors
) {

    return HasStyle;

    /**
    * @worker
    * @type {converter}
    * @param {Element} el The Element to get the style from
    * @param {String} name The name of the style to get
    */
    function HasStyle(el, name) {
        return is_element(el)
            ? !!el.style[name]
            : [
                null
                , `${errors.test.client.conversions.element_required} HasStyle`
            ]
        ;
    }
}