/**
* This factory produces a worker function that tests if a value matches a RegExp
* pattern
* @factory
*/
function _Matches(
    utils_regExGetMatches
) {

    return Matches;

    /**
    * @worker
    * @type {assertion}
    * @param {string} value The value under test
    * @param {RegExp} patt The RegExp pattern
    * @param {number} [cnt] Optional number of times the value matches
    * @return {boolean}
    */
    function Matches(value, patt, cnt) {

        var matches = utils_regExGetMatches(
            patt
            , value
        );

        return [
            (!!cnt)
            ? matches.length === cnt 
            : matches.length > 0
            , [
                matches.length
                , cnt
                || "any"
            ]
        ];
    }
}