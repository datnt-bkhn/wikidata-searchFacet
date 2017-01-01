/**
 * Created by tintin on 6/16/2016.
 */

app.factory('wikidataIndex', function($http) {
    return {
        getIndexFile: function(){
            var urlIndexFile = 'app/data/Index.json';

            return $http.get(urlIndexFile).success(function(data) {
                // you can do some processing here
                return data;
            });
        },
        //get property datatype statistic
        loadPropertyDataTypeStatistic: function(){
            var urlFacetFile = 'app/data/propertyDataTypeStatistic.json';

            return $http.get(urlFacetFile).then(function(content) {
                return content.data;
            }, function(error){
                throw "error in loading file property data type";
            });
        },
        //get content file
        getQuery: function(queryFile){
            var urlFacetFile = 'app/data/'+ queryFile;

            return $http.get(urlFacetFile).then(function(content) {
                return content.data;
            }, function(error){
                throw "error in loading file property data type";
            });
        }
    }

});