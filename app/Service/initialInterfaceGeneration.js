app.factory('InitInterfaceGeneration', function($http) {
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
        }
    }

});