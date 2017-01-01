/**
 * Created by tintin on 10/26/2016.
 */

app.factory('facetValueManager', function($http,utilities,wikidataAPI,wikidataConstant,wikidataSharedData,facetParser) {

    var getFacetValueMinMaxQuery=function(facet){
        var query=wikidataSharedData.query["ShowFacetValueMinMax"];
        var result=query.replace('$1$',wikidataSharedData.config.keyword)
            .replace('$2$',facet.Id);
        console.log(result);
        return result;
    }

    var getFacetValuesQuery=function(facet){
        var query=wikidataSharedData.query["ShowFacetValue"];
        var result=query.replace('$1$',wikidataSharedData.config.keyword)
            .replace('$2$',facet.Id)
            .replace('$3$',wikidataSharedData.config.limitItemsInSubQuery)
            .replace('$4$',wikidataSharedData.config.limitFacetValue)
            .replace('$5$',wikidataSharedData.config.languageCode)
            .replace('$c$', facetParser.getCondition());
        console.log(result);
        return result;
    }
    
    var getNextLevelClassQuery=function(facet){
        var query=wikidataSharedData.query["ShowNextLevelClass"];
        var result=query.replace('$1$',wikidataSharedData.config.keyword)
            .replace('$2$',facet.Id)
            .replace('$3$','5000')
            .replace('$4$','3')
            .replace('$5$',wikidataSharedData.config.languageCode);
        console.log(result);
        return result;
    }
    
    var showFacetValue = function(facet){
        
        var preCalculatedFacets= _.propertyOf(wikidataSharedData.mapClassFacets)(wikidataSharedData.config.keyword);
        if(preCalculatedFacets){

        }
        else{
            var propertyId=facet["Id"];
            var propertyDataType=wikidataSharedData.mapPropertyDataType[propertyId];
            facet["fValues"]={};
            facet["fValues"]["dataType"]=propertyDataType;
            facet["fValues"]["values"]=[];
            if(propertyDataType==wikidataConstant.propertyDataType["Quantity"] 
                || propertyDataType==wikidataConstant.propertyDataType["Time"])
            {
                var facetValueMinMaxQuery=getFacetValueMinMaxQuery(facet);
                wikidataAPI.sendQuery(facetValueMinMaxQuery)
                    .then(
                        function(facetValueResult) {
                            facet["fValues"]["min"]= facetValueResult[0].minFacetValue.value;
                            facet["fValues"]["max"]= facetValueResult[0].maxFacetValue.value;
                        }
                    );

            }
            else if( propertyDataType==wikidataConstant.propertyDataType["Url"]
                || propertyDataType==wikidataConstant.propertyDataType["WikibaseItem"]
                || propertyDataType==wikidataConstant.propertyDataType["String"]
                ||propertyDataType==wikidataConstant.propertyDataType["Monolingualtext"])
            {
                var facetValueQuery=getFacetValuesQuery(facet);//
                //add value any
                var newValueObject={};
                newValueObject["uri"]="Any";
                newValueObject["entityId"]="Any";
                newValueObject["text"]="Any";
                newValueObject["isAny"]=true;
                newValueObject["fQualifiers"]={};

                facet["fValues"]["values"].push(newValueObject);
                //
                wikidataAPI.sendQuery(facetValueQuery)
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
    
    var changeFacetValue =function($event,facet,facetValue){

        if(facetValue.text=="Any"){
            console.log("Any");
            $scope.showQualifiers($event,facet,facetValue);
            $scope.showNextLevel($event,facet);

        }
        else{
            $scope.showQualifiers($event,facet,facetValue);
            $scope.changeSelectedValue=true;

            //getResults();
            //getCondition();
            //showFacetValue($event,facet);
            //$scope.showQualifiers($event,facet);
            _.each($scope.facets, function(facet){
                if(!facet["fProperty"]["isPropertyType"]){
                    updateFacetNumberInstances(facet);
                }

            });
        }
    }

    var showNextLevel=function(facet){

        //do sth
        facet["fNextLevel"]={};
        facet["fNextLevel"]["fClass"]=[];
        //getCondition();
        var query= getNextLevelClassQuery(facet);

        wikidataAPI.sendQuery(query).then(function(returnedResult){
           _.each(returnedResult,function(classResult){
              var newClass={};
               newClass["uri"]=classResult.class.value;
               newClass["entityId"]=utilities.getEntityId(classResult.class.value);
               newClass["text"]=classResult.classLabel.value;
               newClass["isSelected"]=false;
               facet["fNextLevel"]["fClass"].push(newClass);
           });
            //getFacet(classId,facet["fNextLevel"]);
        });
    }

    return {
        showFacetValue: showFacetValue,
        changeFacetValue: changeFacetValue,
        showNextLevel:showNextLevel
    }

});