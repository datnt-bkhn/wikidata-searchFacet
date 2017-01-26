describe('TODO list', function() {
    beforeEach(function() {
        browser.get('http://localhost:8000/index.html');
        //ptor = protractor.getInstance();
    });

    it('should filter results', function() {

        // Find the first (and only) button on the page and click it
        element(by.css('.ct-md-button')).click();
        browser.waitForAngular();
        //browser.pause();
        element.all(by.css('.div_facetProperty')).get(0).click();
        browser.waitForAngular();
        browser.pause();
        element(by.css('.ct-md-button')).click();
    });
});