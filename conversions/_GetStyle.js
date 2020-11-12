/**
*
* @factory
*/
function _GetStyle(
    is_element
    , errors
) {


    return GetStyle;

    /**
    * @worker
    * @type {converter}
    * @param {Element} el The Element to get the style from
    * @param {String} name The name of the style to get
    */
    function GetStyle(el, name) {
        return is_element(el)
            ? el.style[name]
            : [
                null
                , `${errors.test.client.conversions.element_required} GetStyle`
            ]
        ;
    }
}