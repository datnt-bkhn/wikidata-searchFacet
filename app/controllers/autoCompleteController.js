app.controller('autoComplete', function($scope,$http,$log,wikidataAPI,config) {

    $scope.init = function () {

        $scope.querySearch   = querySearch;
        $scope.selectedItemChange = selectedItemChange;
        $scope.searchTextChange   = searchTextChange;

    }
    $scope.init();
    $scope.config=config;

    function querySearch (query) {
        //var results = query ? $scope.states.filter( createFilterFor(query) ) : $scope.states ;
        //return results;

        return wikidataAPI.getSuggestion(query,'en')
                .then(function(suggestionResult){
                    return suggestionResult.map(function(suggestion){
                       return {
                           id:suggestion.id,
                           url:suggestion.url,
                           label:suggestion.label,
                           display:suggestion.label+' ('+suggestion.description+') - '+suggestion.title
                       }
                    });
                    //return suggestionResult;
                });



    }
    function searchTextChange(text) {
        $log.info('Text changed to ' + text);
    }
    function selectedItemChange(item) {
        $log.info('Item changed to ' + JSON.stringify(item));
        $scope.config.keyword=item.id;
    }

});