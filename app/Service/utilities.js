/**
 * Created by tintin on 6/16/2016.
 */

app.factory('utilities', function($http) {

    var getFacets=function(){
        var urlFacetFile = 'app/data/facets.json';

        return $http.get(urlFacetFile).then(function(content) {
            return content.data;
        }, function(error){
            throw "error in loading file facets";
        });
    }

    var getEntityId=function(entity){
        return entity.substring(entity.lastIndexOf("/")+1,entity.length);
    }

    var getCondition=function(){

    }


    return {
        //get facets model
        getFacets: getFacets,
        getEntityId: getEntityId,
        getCondition: getCondition
    }

});