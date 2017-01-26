app.factory('facetManager', function($http, utilities, wikidataAPI, wikidataConstant, wikidataSharedData, facetParser, queryManager,exceptionManager) {


    var showFacet = function(typeId){

        wikidataSharedData.facets["fFacet"]=[];

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
            //var initInterfaceQuery = getShowFacetQuery(typeId);
            var initInterfaceQuery = queryManager.showFacetQuery(null);
            return wikidataAPI.sendQuery(initInterfaceQuery)
                .then(function (facetPropertyResult) {
                    wikidataSharedData["loader"]["isLoadingFacet"] = false;
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
                            newObject["level"] = 1;
                            newObject["isActive"] = false;
                            //for fProperty
                            var fPropertyObject = {};
                            if (propertyId == "P31") {
                                fPropertyObject["isPropertyType"] = true;
                            }
                            else {
                                fPropertyObject["isPropertyType"] = false;
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
                                wikidataSharedData.facets["fFacet"].push(newObject);
                            }

                        }
                    });
                })
                .catch(function (error) {
                        if (error instanceof exceptionManager) {
                            throw error;
                        }
                        else {
                            var exception = new exceptionManager(error, 6, "Error in show Facet");
                            throw exception;
                        }

                        console.log('error initInterfaceQuery' + error);
                    }
                );
        }
    }

    var reGenerateFacet=function(facet,facetValue){
        //var query=getShowFacetQuery(null);
        //var query = queryManager.showFacetQuery(null);
        var query=queryManager.reGenerateFacetQuery();

        return wikidataAPI.sendQuery(query)
            .then(
                function (facetPropertyResult) {
                    _.each(wikidataSharedData.facets["fFacet"],function(existingFacetObject){
                        var foundFacetObject=_.find(facetPropertyResult,function(element){
                            return utilities.getEntityId(element.property.value)==existingFacetObject["Id"];
                        })
                        if(foundFacetObject){
                            existingFacetObject["fInterface"]["numberItems"]=parseInt(foundFacetObject.numberItems.value);
                            //existingFacetObject["numberItems"]=parseInt(foundFacetObject.numberItems.value);
                        }
                        else{
                            existingFacetObject["fInterface"]["numberItems"]=0;
                            //existingFacetObject["numberItems"]=0;
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

    var showClassNextLevel=function(facet){
        //do sth
        facet["fNextLevel"]={};
        facet["fNextLevel"]["fClass"]=[];
        facet["fNextLevel"]["fInterface"]={"isActiveShowNextLevel":true};
        //getCondition();
        var query= queryManager.showClassNextLevelQuery(facet);

        return wikidataAPI.sendQuery(query).then(function(returnedResult){
            _.each(returnedResult,function(classResult){
                var newClass={};
                newClass["uri"]=classResult.class.value;
                newClass["entityId"]=utilities.getEntityId(classResult.class.value);
                newClass["text"]=classResult.classLabel.value;
                newClass["isSelected"]=false;
                facet["fNextLevel"]["fClass"].push(newClass);
            });
        });
    }

    var showFacetNextLevel=function(facet,fNextLevel){
        //var query=getFacetNextLevelQuery(facet,fNextLevel);
        var query=queryManager.showFacetQuery(facet);
        
        fNextLevel["fFacet"]=[];
        //check there is at least one class is selected
        var existSelectedClass=false;
        _.each(facet["fNextLevel"]["fClass"],function(eClass){
            if(eClass["isSelected"]) {
                existSelectedClass=true;
                //break;//not supported by underscore
            }
        })
        if(existSelectedClass) {
            return wikidataAPI.sendQuery(query)
                .then(function (facetPropertyResult) {
                    _.each(facetPropertyResult, function (facetProperty) {
                        var propertyUri = facetProperty.property.value;//in format http://wikidata.org/property/P21
                        var numberItems = facetProperty.numberItems.value;
                        var propertyId = utilities.getEntityId(propertyUri);
                        if (wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["WikibaseItem"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Url"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["String"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Quantity"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Time"]
                            || wikidataSharedData.mapPropertyDataType[propertyId] == wikidataConstant.propertyDataType["Monolingualtext"]) {
                            var newObject = {};
                            newObject["Id"] = propertyId;
                            newObject["level"] = 2;
                            newObject["isActive"] = false;
                            newObject["parent"] = facet;
                            //for fProperty
                            var fPropertyObject = {};
                            if (propertyId == "P31") {
                                fPropertyObject["isPropertyType"] = true;
                            }
                            else {
                                fPropertyObject["isPropertyType"] = false;
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
                                fNextLevel["fFacet"].push(newObject);
                            }

                        }
                    });
                    //return;
                })
                .catch(function (error) {
                        console.log('error initInterfaceQuery' + error);
                        if (error instanceof exceptionManager) {
                            throw error;
                        }
                        else {
                            var exception = new exceptionManager(error, 7, "Error in show Facet");
                            throw exception;
                        }

                    }
                );
        }
    }

    return {
        showFacet: showFacet,
        showFacetNextLevel:showFacetNextLevel,
        reGenerateFacet:reGenerateFacet,
        showClassNextLevel:showClassNextLevel
    }

    /*
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
     var getFacetNextLevelQuery=function(facet,fNextLevel){
     var query=wikidataSharedData.query["InitializeFacetNextLevel"];
     var result=query.replace('$1$',wikidataSharedData.config.keyword)
     .replace('$2$',facet.Id)
     .replace('$3$',fNextLevel["fClass"][0]["entityId"])
     .replace('$4$',wikidataSharedData.config.languageCode)
     .replace('$5$',20)
     .replace('$c$', facetParser.getCondition());
     console.log(result);
     return result;
     }
     */
});

