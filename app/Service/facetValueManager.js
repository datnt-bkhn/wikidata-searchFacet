/**
 * Created by tintin on 10/26/2016.
 */

app.factory('facetValueManager', function($http,utilities,wikidataAPI,wikidataConstant,wikidataSharedData,facetParser,queryManager) {

        
    var showFacetValue = function(facet){
        
        var preCalculatedFacets= _.propertyOf(wikidataSharedData.mapClassFacets)(wikidataSharedData.config.keyword);
        if(preCalculatedFacets){

        }
        else{
            var propertyId=facet["Id"];
            var propertyDataType=wikidataSharedData.mapPropertyDataType[propertyId];
            facet["isActive"]=true;//set this facet is active. At any time, each level has only one facet which isActive=true
            facet["fValues"]={};
            facet["fValues"]["dataType"]=propertyDataType;
            facet["fValues"]["values"]=[];
            if(propertyDataType==wikidataConstant.propertyDataType["Quantity"] 
                || propertyDataType==wikidataConstant.propertyDataType["Time"])
            {
                var facetValueMinMaxQuery=queryManager.showFacetValueMinMaxQuery(facet);
                return wikidataAPI.sendQuery(facetValueMinMaxQuery)
                    .then(
                        function(facetValueResult) {
                            facet["fValues"]["min"]= parseInt(facetValueResult[0].minFacetValue.value);
                            facet["fValues"]["max"]= parseInt(facetValueResult[0].maxFacetValue.value);
                        }
                    );

            }
            else if( propertyDataType==wikidataConstant.propertyDataType["Url"]
                || propertyDataType==wikidataConstant.propertyDataType["WikibaseItem"]
                || propertyDataType==wikidataConstant.propertyDataType["String"]
                ||propertyDataType==wikidataConstant.propertyDataType["Monolingualtext"])
            {
                //var facetValueQuery=getFacetValuesQuery(facet);//
                var facetValueQuery=queryManager.showFacetValueQuery(facet);
                //add value any
                var newValueObject={};
                newValueObject["uri"]="Any";
                newValueObject["entityId"]="Any";
                newValueObject["text"]="Any";
                newValueObject["isAny"]=true;
                newValueObject["fQualifiers"]={};

                facet["fValues"]["values"].push(newValueObject);
                //
                return wikidataAPI.sendQuery(facetValueQuery)
                    .then(
                        function(facetValueResult) {
                            _.each(facetValueResult,function(facetValue){
                                var valueText=facetValue.facetValue.value;//in format http://wikidata.org/property/P21
                                var numberFound=facetValue.numberInstances.value;
                                var newValueObject={};
                                newValueObject["uri"]=valueText;
                                newValueObject["entityId"]=utilities.getEntityId(valueText);
                                newValueObject["text"]=facetValue.facetValueLabel.value;
                                newValueObject["numberItems"]=facetValue.numberItems.value;
                                newValueObject["fQualifiers"]={};
                                facet["fValues"]["values"].push(newValueObject);

                            });
                        }
                    );

            }
        }


    };
    
    return {
        showFacetValue: showFacetValue
    }

});