TruJS.test.mock.mocked._MockXMLHttpRequest = (function (xmlHttpRequest, mock) {
    //return the mock of the element
    return mock(new xmlHttpRequest());
});
