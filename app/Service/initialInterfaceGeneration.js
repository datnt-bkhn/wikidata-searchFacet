app.factory('initialInterfaceGeneration', function($http,utilities,wikidataAPI,wikidataConstant,wikidataSharedData,facetParser) {

    var getShowFacetQuery=function(typeId){
        var query=wikidataSharedData.query["ShowFacet"];
        var result=query.replace('$1$',wikidataSharedData.config.keyword)
            .replace('$2$',wikidataSharedData.config.limitResultInSubQuery)
            .replace('$3$',wikidataSharedData.config.languageCode)
            .replace('$4$',wikidataSharedData.config.limitFacets)
            .replace('$c$', facetParser.getCondition());
        console.log(result);
        return result;
    };
    
    var generateInterface = function(typeId){
        var preCalculatedFacets= _.propertyOf(wikidataSharedData.mapClassFacets)(wikidataSharedData.config.keyword);
        if(preCalculatedFacets){
            _.each(preCalculatedFacets,function(facet){
                var newFacet={};
                newFacet.text=facet.P;
                newFacet.fullLink=facet.P;
                newFacet.abbrLink=facet.P;
                newFacet.number=facet.Pc;
                newFacet.id=facet.P;
                newFacet.isExpand=false;
                newFacet.iconText='+';
                newFacet.isFirstInit=true;
                newFacet.value=[];
                _.each(facet.Pv, function(facetValue){
                    var newFacetValue={};
                    newFacetValue.text=facetValue.V;
                    newFacetValue.abbrLink=facetValue.V;
                    newFacetValue.number=facetValue.Vc;
                    newFacet.value.push(newFacetValue);
                });
                //console.log(newFacet.id);
                wikidataSharedData.facets.push(newFacet);
            });
        }
        else {
            var initInterfaceQuery = getShowFacetQuery(typeId);
            console.log("-init query---------:\n" );
            console.log( initInterfaceQuery);
            
            wikidataAPI.sendQuery(initInterfaceQuery)
                .then(
                    function (facetPropertyResult) {
                        _.each(facetPropertyResult, function (facetProperty) {
                            var propertyUri = facetProperty.property.value;//in format http://wikidata.org/property/P21
                            var numberItems = facetProperty.numberItems.value;
                            var propertyId = propertyUri.substring(propertyUri.lastIndexOf("/") + 1, propertyUri.length);
                            if (wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["WikibaseItem"]
                                || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Url"]
                                || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["String"]
                                || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Quantity"]
                                || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Time"]
                                || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Monolingualtext"]) {
                                var newObject = {};
                                newObject["Id"] = propertyId;
                                //for fProperty
                                var fPropertyObject = {};
                                if (propertyId == "P31") {
                                    fPropertyObject["isPropertyType"] = true;
                                }
                                else fPropertyObject["isPropertyType"] = false;
                                fPropertyObject["uri"] = propertyUri;
                                fPropertyObject["entityId"] = propertyId;
                                fPropertyObject["text"] = facetProperty.propertyLabel.value;
                                newObject["fProperty"] = fPropertyObject;
                                //for fInterface
                                var fInterfaceObject = {};
                                fInterfaceObject["iconText"] = "+";
                                fInterfaceObject["isExpand"] = false;
                                fInterfaceObject["isInit"] = true;
                                fInterfaceObject["numberItems"] = numberItems;
                                newObject["fInterface"] = fInterfaceObject;
                                wikidataSharedData.facets.push(newObject);
                            }
                        });
                        //return;
                    },
                    function (error) {
                        console.log('error initInterfaceQuery' + error);
                    }
                );
        }
    }

    var getFacetNextLevelQuery=function(facet,fNextLevel){
        var query=wikidataSharedData.query["InitializeFacetNextLevel"];
        var result=query.replace('$1$',wikidataSharedData.config.keyword)
            .replace('$2$',facet.Id)
            .replace('$3$',fNextLevel["fClass"][0]["entityId"])
            .replace('$4$',wikidataSharedData.config.languageCode)
            .replace('$5$',20);
        console.log(result);
        return result;
    }


    var reGenerateFacet=function(facet,facetValue){
        var query=getShowFacetQuery(null);
        return wikidataAPI.sendQuery(query)
            .then(
                function (facetPropertyResult) {
                    _.each(wikidataSharedData.facets,function(existingFacetObject){
                        var foundFacetObject=_.find(facetPropertyResult,function(element){
                            return utilities.getEntityId(element.property.value)==existingFacetObject["Id"];
                        })
                        if(foundFacetObject){
                            existingFacetObject["fInterface"]["numberItems"]=foundFacetObject.numberItems.value;
                            existingFacetObject["numberItems"]=parseInt(foundFacetObject.numberItems.value);
                        }
                        else{
                            existingFacetObject["fInterface"]["numberItems"]=0;
                            existingFacetObject["numberItems"]=0;
                        }
                    });
                    /*
                    var newFacet=_.sortBy(wikidataSharedData.facets, function(element){
                        return element["fInterface"]["numberItems"];
                    })
                    */
                    var newFacet=null;
                    //newFacet=_.sortBy(wikidataSharedData.facets, 'numberItems').reverse();
                    //wikidataSharedData.facets=newFacet;
                    return newFacet;
                }
            );
    }
    
    var generateFacetNextLevel=function(facet,fNextLevel){
        var query=getFacetNextLevelQuery(facet,fNextLevel);

        console.log("------------NextLevel Query----------\n");
        console.log(query);
        fNextLevel["fFacet"]=[];
        wikidataAPI.sendQuery(query)
            .then(
                function (facetPropertyResult) {
                    _.each(facetPropertyResult, function (facetProperty) {
                        var propertyUri = facetProperty.facet.value;//in format http://wikidata.org/property/P21
                        var numberFound = facetProperty.numberFound.value;
                        var propertyId = propertyUri.substring(propertyUri.lastIndexOf("/") + 1, propertyUri.length);
                        if (wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["WikibaseItem"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Url"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["String"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Quantity"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Time"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Monolingualtext"]) {
                            var newObject = {};
                            newObject["Id"] = propertyId;
                            //for fProperty
                            var fPropertyObject = {};
                            if (propertyId == "P31") {
                                fPropertyObject["isPropertyType"] = true;
                            }
                            else fPropertyObject["isPropertyType"] = false;
                            fPropertyObject["uri"] = propertyUri;
                            fPropertyObject["entityId"] = propertyId;
                            fPropertyObject["text"] = facetProperty.propertyLabel.value;
                            newObject["fProperty"] = fPropertyObject;
                            //for fInterface
                            var fInterfaceObject = {};
                            fInterfaceObject["iconText"] = "+";
                            fInterfaceObject["isExpand"] = false;
                            fInterfaceObject["isInit"] = true;
                            fInterfaceObject["numberItems"] = numberFound;
                            newObject["fInterface"] = fInterfaceObject;
                            fNextLevel["fFacet"].push(newObject);
                        }
                    });
                    //return;
                },
                function (error) {
                    console.log('error initInterfaceQuery' + error);
                }
            );
    }
    return {
        generateInterface: generateInterface,
        generateFacetNextLevel:generateFacetNextLevel,
        reGenerateFacet:reGenerateFacet
    }

});