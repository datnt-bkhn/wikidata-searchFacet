/**
 * Created by tintin on 6/16/2016.
 */

app.factory('utilities', function($http) {
    return {
        //get facets model
        getFacets: function(){
            var urlFacetFile = 'app/data/facets.json';

            return $http.get(urlFacetFile).then(function(content) {
                return content.data;
            }, function(error){
                    throw "error in loading file facets";
            });
        }
    }

});