

app.controller('wikidataController', function($scope,$q,$http,wikidataAPI,config, wikidataIndex,utilities) {
    $scope.keyword = "human";
    $scope.search=function(){
        //var query ="select ?u where {?u wdt:P31 wd:Q5.} limit 100";
        var query='select ?u ?uLabel where {wd:Q5 wdt:P1963 ?u .  SERVICE wikibase:label {bd:serviceParam wikibase:language "en" .}} limit 10 offset 1';
        sendQuery(query);
    }

    $scope.results=[];
    $scope.numberResults=0;
    var numberResultsQuery="";


    $scope.facets=[];
    $scope.changeSelectedValue=false;
    $scope.conditionQuery=""//convert selected value in facet to condition
    $scope.type="http://www.wikidata.org/entity/Q4022";

    $scope.language="en";
    $scope.limitFacets=50;
    $scope.limitInstances=10000;

    $scope.numberFacetValues=10;//number of facet values are shown at the first time
    $scope.numberNextFacetValues=5;//number of facet values are shown next time.
    $scope.config=config;

    $scope.typeId=$scope.config.keyword;

    $scope.runningQuery="";
    $scope.indexData={};
    $scope.propertyDataType={};

    $scope.generateInitInterface =function() {
        $scope.type="http://www.wikidata.org/entity/"+$scope.config.keyword;
        $scope.typeId=$scope.config.keyword;
        $scope.facets=[];

        var preCalculatedFacets= _.propertyOf($scope.indexData.data)($scope.config.keyword);
        if(preCalculatedFacets){
            $scope.facets=[];

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
                $scope.facets.push(newFacet);
            });
        }
        else {
            var initInterfaceQuery=getInitInterfaceQuery($scope.typeId);
            wikidataAPI.sendQuery(initInterfaceQuery)
                .then(
                    function (facetPropertyResult){
                        _.each(facetPropertyResult,function(facetProperty){
                            var propertyUri=facetProperty.facet.value;//in format http://wikidata.org/property/P21
                            var numberFound=facetProperty.numberFound.value;
                            var propertyId=propertyUri.substring(propertyUri.lastIndexOf("/")+1,propertyUri.length);
                            if($scope.propertyDataType[propertyId]=="WikibaseItem"||$scope.propertyDataType[propertyId]=="Url"
                                || $scope.propertyDataType[propertyId]=="String"||$scope.propertyDataType[propertyId]=="Quantity"
                                ||$scope.propertyDataType[propertyId]=="Time"||$scope.propertyDataType[propertyId]=="Monolingualtext")
                            {
                                var newObject={};
                                newObject["Id"]=propertyId;
                                //for fProperty
                                var fPropertyObject={};
                                if(propertyId=="P31"){
                                    fPropertyObject["isPropertyType"]=true;
                                }
                                else fPropertyObject["isPropertyType"]=false;
                                fPropertyObject["uri"]=propertyUri;
                                fPropertyObject["entityId"]=propertyId;
                                newObject["fProperty"]=fPropertyObject;
                                //for fInterface
                                var fInterfaceObject={};
                                fInterfaceObject["iconText"]="+";
                                fInterfaceObject["isExpand"]=false;
                                fInterfaceObject["isInit"]=true;
                                newObject["fInterface"]=fInterfaceObject;
                                $scope.facets.push(newObject);


                                var propertyLabelQuery=getPropertyLabelQuery(propertyUri);
                                wikidataAPI.sendLabelQuery(propertyLabelQuery,propertyId).then(
                                    function(returnedData){
                                        var label=returnedData["data"][0]["propertyLabel"].value;
                                        var propertyId=returnedData["entityId"];
                                        var oldFacet=_.find($scope.facets,function(facet){
                                            return facet["Id"]==propertyId;
                                        });
                                        oldFacet["fProperty"]["text"]=label;
                                    }
                                );
                            }
                        });
                    },
                    function (error){
                        console.log('error initInterfaceQuery'+error);
                    }
                );

        }
        
        getResults();

    }

    $scope.showHideFacet=function($event,facet){
        $event.stopPropagation();
        var fInterface=facet.fInterface;
        if(fInterface.isExpand){
            fInterface.isExpand=false;
            fInterface.iconText='+';
        }
        else{
            fInterface.isExpand=true;
            fInterface.iconText='-';
            //if(fInterface.isInit){
                showFacetValue($event,facet);
            //}

        }
    }

    $scope.refresh=function($event,facet){
        showFacetValue($event,facet);
    }

    $scope.showQualifiers=function ($event,facet){
        var propertyId=facet["Id"];
        facet["fQualifiers"]={};
        facet["fQualifiers"]["isExpand"]=true;
        facet["fQualifiers"]["hasQualifiers"]=[];
        var facetQualifiersQuery=getQualifierQuery(facet);
        wikidataAPI.sendQuery(facetQualifiersQuery).then(function(returnedQualifiersData){
            _.each(returnedQualifiersData,function(qualifierProperty){
                var newQualifier={};
                newQualifier["qProperty"]={};
                newQualifier["qProperty"]["uri"]=qualifierProperty.qualifier.value;
                newQualifier["qProperty"]["entityId"]=getEntityId(newQualifier["qProperty"]["uri"]);
                newQualifier["qInterface"]={};
                newQualifier["qInterface"]["iconText"]="+";
                newQualifier["qInterface"]["isExpand"]=false;
                newQualifier["qInterface"]["isInit"]=true;

                facet["fQualifiers"]["hasQualifiers"].push(newQualifier);
                
                var propertyLabelQuery=getPropertyLabelQuery(qualifierProperty.qualifier.value);
                wikidataAPI.sendLabelQuery(propertyLabelQuery,newQualifier["qProperty"]["entityId"]).then(
                    function(returnedData){
                        var label=returnedData["data"][0]["propertyLabel"].value;
                        var propertyId=returnedData["entityId"];
                        var oldQualifierObject=_.find(facet["fQualifiers"]["hasQualifiers"],function(fQualifierObject){
                            return fQualifierObject["qProperty"]["entityId"]==propertyId;
                        });
                        oldQualifierObject["qProperty"]["text"]=label;
                    }
                );


            })
        })

    }

    $scope.showHideQualifierValue=function($event,facetQualifier,facet){
        $event.stopPropagation();
        var qInterface=facetQualifier.qInterface;
        if(qInterface.isExpand){
            qInterface.isExpand=false;
            qInterface.iconText='+';
        }
        else{
            qInterface.isExpand=true;
            qInterface.iconText='-';
            if(qInterface.isInit){
                showQualifierValue(facetQualifier,facet);
            }

        }
    }

    $scope.changeFacetValue =function($event,facetValue,facet){
        $scope.changeSelectedValue=true;

        getResults();
        getCondition();
        //showFacetValue($event,facet);
        //$scope.showQualifiers($event,facet);
        _.each($scope.facets, function(facet){
            if(!facet["fProperty"]["isPropertyType"]){
                updateFacetNumberInstances(facet);
            }

        });
    }

    $scope.changeQualifierValue=function(qualifierValue,facetQualifier,facet){
        getResults();
    }

    $scope.showResult =function(){
        getResults();

    };

    $scope.showNextLevel=function($event,facet){
        $event.stopPropagation();
        //do sth
        facet["fNextLevel"]=[];

        getCondition();
        var query= 'select ?class\
        where \
        { \
            ?item wdt:P31 wd:'+ $scope.typeId +'. \
            ?item wdt:'+ facet.Id + ' ?facetValue. \
            ?facetValue wdt:P31 ?class. \
        } \
        limit 1';
        wikidataAPI.sendQuery(query).then(function(returnedResult){
            var classIRI=returnedResult[0]["class"].value;
            var classId=getEntityId(classIRI);
            getFacet(classId,facet["fNextLevel"]);
        });

    }
   

    $scope.reGenerateInterface=function(){
      console.log($scope.facets);
    };

    $scope.showQualifier =function ($event,facet,facetValue){
        $event.stopPropagation();
        showQualifierValue(facet,facetValue);

    }

    $scope.delete =function($event,facet){
        $event.stopPropagation();
        var newFacets=_.without($scope.facets,_.findWhere($scope.facets,{fullLink:facet.fullLink}));
        $scope.facets=newFacets;
    }

    $scope.addFacetValueCondition=function($event,fValues){
        var newValue={};
        newValue["condition"]="<=";
        newValue["threshold"]="1995";
        newValue["isSelected"]=true;
        fValues.values.push(newValue);
    }

    var getResults=function(){
        $scope.results=[];

        var resultQuery=getResultQuery();

        wikidataAPI.sendQuery(resultQuery)
            .then(
                function(result){
                    $scope.results=result;
                }
            );
        //get number results of query

        wikidataAPI.sendQuery(numberResultsQuery)
            .then(
                function(result){
                    $scope.numberResults=result[0]["numberItems"].value;
                }
            );

    }


    var getInitInterfaceQuery=function(typeClass){
        getCondition();
        var query='Select ?facet (count (?facet) as ?numberFound) \
            where { \
             hint:Query hint:optimizer "None" . \
            { select ?item  where { ?item wdt:P31 wd:'+typeClass + '. } limit ' + $scope.limitInstances + '  } \
            ?item ?facet ?value. \
            '+ $scope.conditionQuery+' \
             filter strstarts(str(?facet),"http://www.wikidata.org/prop/direct") \
             } \
            group by ?facet  \
            order by DESC (?numberFound) \
            limit ' + $scope.limitFacets;

        /*
        var query='SELECT ?facet (count (?facet) as ?numberFound) \
        WHERE { \
            ?item wdt:P31 wd:'+ typeClass +'. \
                ?item ?facet ?value. \
                filter strstarts(str(?facet),"http://www.wikidata.org/prop/direct") \
        } \
        group by ?facet \
            order by DESC (?numberFound) \
        limit 50' ;*/
        $scope.runningQuery=query;
        return query;
    }

    var getFacetValuesQuery=function(facet){
        getCondition();
        var query= 'select ?facetValue (count (?facetValue) as ?numberInstances) \
        where \
        { \
            ?item wdt:P31 wd:'+ $scope.typeId +'. \
            ?item wdt:'+ facet.Id + ' ?facetValue. \
            '+ $scope.conditionQuery+' \
        } \
        group by ?facetValue \
        order by DESC (?numberInstances) \
        limit '+ $scope.numberFacetValues;
        $scope.runningQuery=query;
        return query;
    }

    var getFacetValueMinMaxQuery=function(facet){
        var query='select (min(?facetValue) as ?minFacetValue) (max(?facetValue) as ?maxFacetValue) \
        where \
        { \
            ?item wdt:P31 wd:'+ $scope.typeId +'. \
            ?item wdt:'+ facet.Id + ' ?facetValue. \
            filter isLiteral(?facetValue). \
        }';
        $scope.runningQuery=query;
        return query;
    }

    var getQualifierQuery=function(facet){
        var query='select ?qualifier (count(?qualifier) as ?countQualifier) \
        where \
        { \
            ?item wdt:P31 wd:'+ $scope.typeId + '. \
            ?item p:'+ facet["Id"] + ' ?statement. \
            ?statement ?qualifier ?qualifierValue. \
            '+ $scope.conditionQuery+' \
            filter strstarts(str(?qualifier),"http://www.wikidata.org/prop/qualifier/P") \
        } \
        group by (?qualifier) \
        order by DESC(?countQualifier) \
        limit 10' ;
        $scope.runningQuery=query;
        return query;
    }

    var getQualifierValueQuery=function(facetQualifier,facet){

        var query='select ?qualifierValue (count(?qualifierValue) as ?numberFound) \
        where \
        { \
            ?item wdt:P31 wd:'+ $scope.typeId + '. \
            ?item p:'+ facet["Id"] + ' ?statement. \
            ?statement pq:' + facetQualifier["qProperty"]["entityId"] +' ?qualifierValue. \
            '+ $scope.conditionQuery+' \
        } \
        group by (?qualifierValue) \
        order by DESC(?qualifierValue) \
        limit 10' ;
        $scope.runningQuery=query;
        return query;
    }

    var getResultQuery=function(){
        var resultQuery="";

        var facetValueCondition=[];
        var facetQualifierCondition=[];

        _.each($scope.facets,function(facet){

            var valueCondition=[];
            var valueQuery="";

            var qualifierValueCondition=[];
            var qualifierValueQuery="";

            var iStatement=0;
            if(!facet["fProperty"]["isPropertyType"]){
                try{
                    _.each(facet["fValues"]["values"],function(facetValue){
                        if(facetValue["isSelected"]){
                            valueCondition.push('{?item wdt:'+ facet["Id"] + ' wd:'+facetValue["entityId"]+'}')
                        }
                    })
                    if(valueCondition.length>0){
                        facetValueCondition.push("{"+ valueCondition.join(" UNION ") +"}");
                    }

                }
                catch(err){
                    console.log(err);
                }
                try
                {
                    _.each(facet["fQualifiers"]["hasQualifiers"],function(qualifier){
                        iStatement=iStatement+1;

                        _.each(qualifier["qValues"]["values"],function(qualifierValue){
                            if(qualifierValue["isSelected"]){
                                qualifierValueCondition.push('{?statement'+iStatement+' pq:'+ qualifier["qProperty"]["entityId"] + ' wd:'+qualifierValue["entityId"]+'}')
                            }
                        })
                        if(qualifierValueCondition.length>0){
                            qualifierValueQuery+='{?item p:' + facet["Id"] + ' ?statement'+iStatement+'.';
                            qualifierValueQuery+="{"+ qualifierValueCondition.join(" UNION ") +"}";
                            qualifierValueQuery+="}";
                            facetQualifierCondition.push(qualifierValueQuery);
                        }
                    });
                }
                catch(err){
                    console.log(err);
                }


            }
        });
        var resultQuery=
        'where \
        { \
            ?item wdt:P31 wd:' + $scope.typeId + '.';
        if(facetValueCondition.length>0){
            resultQuery+=facetValueCondition.join(".");
        }
        if(facetQualifierCondition.length>0){
            resultQuery+=facetQualifierCondition.join(".");
        }

         resultQuery+= ' } \
        limit 50';

        numberResultsQuery='select (count (distinct ?item) as ?numberItems) '+resultQuery;
        resultQuery='select distinct ?item ' + resultQuery;
        $scope.runningQuery=resultQuery;

        return resultQuery;
    }

    var getPropertyLabelQuery=function (property){
        var query='SELECT ?propertyLabel \
                    WHERE \
                    { \
                        ?property ?ref <' + property + '>.'
            + '  ?property rdfs:label ?propertyLabel. FILTER (lang(?propertyLabel) = "'+$scope.language+'") \
                     }\
                     limit 1 ';
        return query;
    }

    var getItemLabelQuery=function(item){
        var query= 'select ?itemLabel \
            where \
        {'
            + '<'+ item + '> rdfs:label ?itemLabel \
            filter LANGMATCHES(LANG(?itemLabel), "' + $scope.language + '") \
        } \
        limit 1';
        return query;
    }

    var getEntityId=function(entity){
        return entity.substring(entity.lastIndexOf("/")+1,entity.length);
    }

    var showFacetValue = function($event,facet){
        $event.stopPropagation();
        var preCalculatedFacets= _.propertyOf($scope.indexData.data)($scope.config.keyword);
        if(preCalculatedFacets){

        }
        else{
            var propertyId=facet["Id"];
            var propertyDataType=$scope.propertyDataType[propertyId];
            facet["fValues"]={};
            facet["fValues"]["dataType"]=propertyDataType;
            facet["fValues"]["values"]=[];
            if(propertyDataType=="Quantity" ||propertyDataType=="Time")
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
            else if( propertyDataType=="Url"|| propertyDataType=="WikibaseItem"
                || propertyDataType=="String"||propertyDataType=="Monolingualtext")
            {
                var facetValueQuery=getFacetValuesQuery(facet);
                wikidataAPI.sendQuery(facetValueQuery)
                    .then(
                        function(facetValueResult) {
                            _.each(facetValueResult,function(facetValue){
                                var valueText=facetValue.facetValue.value;//in format http://wikidata.org/property/P21
                                var numberFound=facetValue.numberInstances.value;
                                var newValueObject={};
                                newValueObject["uri"]=valueText;
                                newValueObject["entityId"]=getEntityId(valueText);
                                facet["fValues"]["values"].push(newValueObject);

                                if(propertyDataType=="WikibaseItem"){
                                    var itemLabelQuery=getItemLabelQuery(valueText);
                                    wikidataAPI.sendLabelQuery(itemLabelQuery,newValueObject["entityId"]).then(
                                        function(returnedData){
                                            var label=returnedData["data"][0]["itemLabel"].value;
                                            var itemId=returnedData["entityId"];
                                            var oldValueObject=_.find(facet["fValues"]["values"],function(fValueObject){
                                                return fValueObject["entityId"]==itemId;
                                            });
                                            oldValueObject["text"]=label;
                                        }
                                    );

                                }
                                else if(propertyDataType=="String"){
                                    newValueObject["text"]=valueText;
                                }
                            });
                        }
                    );

            }
        }


    };

    var showQualifierValue=function(facetQualifier,facet){
        /*
        var typeObject=_.propertyOf($scope.indexData.data)($scope.config.keyword);

        if(typeObject){
            var facetObject=_.find(typeObject,function(element){return element.P==facet.abbrLink; });

            var facetValueObject=_.find(facetObject.Pv,function(element){return element.V==facetValue.abbrLink; });

            var qualifierArray=facetValueObject.Q;
            if(qualifierArray){
                facetValue.isExpand=true;
                facetValue.Qualifiers=[];
                _.each(qualifierArray,function(element){
                    var newQualifier={};
                    newQualifier.text=element.Qp;
                    newQualifier.fullLink=element.Qp;
                    newQualifier.Values=[];
                    _.each(element.Qv,function(qualifierValue){
                        var newObject={};
                        newObject.text=qualifierValue.V;
                        newQualifier.Values.push(newObject);
                    });
                    facetValue.Qualifiers.push(newQualifier);
                });
            }
        }
        else{

        }
        */
        facetQualifier["qValues"]={};
        facetQualifier["qValues"]["values"]=[];
        var qualifierValueQuery=getQualifierValueQuery(facetQualifier,facet);
        wikidataAPI.sendQuery(qualifierValueQuery)
            .then(
                function(qualifierValuesResult) {
                    _.each(qualifierValuesResult,function(qualifierValueResult){
                        var newQualifierValue={};
                        newQualifierValue["uri"]=qualifierValueResult.qualifierValue.value;
                        newQualifierValue["entityId"]=getEntityId(qualifierValueResult.qualifierValue.value);
                        facetQualifier["qValues"]["values"].push(newQualifierValue);

                        var itemLabelQuery=getItemLabelQuery(newQualifierValue["uri"]);
                        wikidataAPI.sendLabelQuery(itemLabelQuery,newQualifierValue["entityId"]).then(
                            function(returnedData){
                                var label=returnedData["data"][0]["itemLabel"].value;
                                var itemId=returnedData["entityId"];
                                var oldFacetQualifierValueObject=_.find(facetQualifier["qValues"]["values"],function(quantifierValueObject){
                                    return quantifierValueObject["entityId"]==itemId;
                                });
                                oldFacetQualifierValueObject["text"]=label;
                            }
                        );
                    })
                }
            );
    }

    var getCondition=function(){
        var query="";

        var facetValueCondition=[];
        var facetQualifierCondition=[];

        _.each($scope.facets,function(facet){

            var valueCondition=[];
            var valueQuery="";

            var qualifierValueCondition=[];
            var qualifierValueQuery="";

            var iStatement=0;
            if(!facet["fProperty"]["isPropertyType"]){
                try{
                    _.each(facet["fValues"]["values"],function(facetValue){
                        if(facetValue["isSelected"]){
                            valueCondition.push('{?item wdt:'+ facet["Id"] + ' wd:'+facetValue["entityId"]+'}')
                        }
                    })
                    if(valueCondition.length>0){
                        facetValueCondition.push("{"+ valueCondition.join(" UNION ") +"}");
                    }

                }
                catch(err){
                    console.log(err);
                }
                try
                {
                    _.each(facet["fQualifiers"]["hasQualifiers"],function(qualifier){
                        iStatement=iStatement+1;

                        _.each(qualifier["qValues"]["values"],function(qualifierValue){
                            if(qualifierValue["isSelected"]){
                                qualifierValueCondition.push('{?statement'+iStatement+' pq:'+ qualifier["qProperty"]["entityId"] + ' wd:'+qualifierValue["entityId"]+'}')
                            }
                        })
                        if(qualifierValueCondition.length>0){
                            qualifierValueQuery+='{?item p:' + facet["Id"] + ' ?statement'+iStatement+'.';
                            qualifierValueQuery+="{"+ qualifierValueCondition.join(" UNION ") +"}";
                            qualifierValueQuery+="}";
                            facetQualifierCondition.push(qualifierValueQuery);
                        }
                    });
                }
                catch(err){
                    console.log(err);
                }


            }
        });

        if(facetValueCondition.length>0){
            query+=facetValueCondition.join(".");
        }
        if(facetQualifierCondition.length>0){
            query+=facetQualifierCondition.join(".");
        }
        if(query.length>0) $scope.conditionQuery=query+".";
        else $scope.conditionQuery=query;
        return query;
    }

    var getFacet=function(typeClass,oFacets){
        var initInterfaceQuery=getInitInterfaceQuery(typeClass);
        wikidataAPI.sendQueryReturnParams(initInterfaceQuery,oFacets)
            .then(getFacetSuccess,getFacetError);

    }
    var getFacetSuccess=function (returnedResult){
        var facetPropertyResult=returnedResult["data"];
        var oFacets=returnedResult["oParam"][0];

        _.each(facetPropertyResult,function(facetProperty){
            var propertyUri=facetProperty.facet.value;//in format http://wikidata.org/property/P21
            var numberFound=facetProperty.numberFound.value;
            var propertyId=propertyUri.substring(propertyUri.lastIndexOf("/")+1,propertyUri.length);
            if($scope.propertyDataType[propertyId]=="WikibaseItem"||$scope.propertyDataType[propertyId]=="Url"
                || $scope.propertyDataType[propertyId]=="String"||$scope.propertyDataType[propertyId]=="Quantity"
                ||$scope.propertyDataType[propertyId]=="Time"||$scope.propertyDataType[propertyId]=="Monolingualtext")
            {
                var newObject={};
                newObject["Id"]=propertyId;
                //for fProperty
                var fPropertyObject={};
                if(propertyId=="P31"){
                    fPropertyObject["isPropertyType"]=true;
                }
                else fPropertyObject["isPropertyType"]=false;
                fPropertyObject["uri"]=propertyUri;
                fPropertyObject["entityId"]=propertyId;
                newObject["fProperty"]=fPropertyObject;
                //for fInterface
                var fInterfaceObject={};
                fInterfaceObject["iconText"]="+";
                fInterfaceObject["isExpand"]=false;
                fInterfaceObject["isInit"]=true;
                newObject["fInterface"]=fInterfaceObject;
                oFacets.push(newObject);


                var propertyLabelQuery=getPropertyLabelQuery(propertyUri);
                wikidataAPI.sendLabelQuery(propertyLabelQuery,propertyId).then(
                    function(returnedData){
                        var label=returnedData["data"][0]["propertyLabel"].value;
                        var propertyId=returnedData["entityId"];
                        var oldFacet=_.find(oFacets,function(facet){
                            return facet["Id"]==propertyId;
                        });
                        oldFacet["fProperty"]["text"]=label;
                    }
                );
            }
        });
    }
    var getFacetError= function (error){
        console.log('error initInterfaceQuery'+error);
    }

    var updateFacetNumberInstances=function(facet){
        var query='select (count(distinct ?item) as ?numberItems) \
                    where { \
                    ?item wdt:P31 wd:' + $scope.typeId + '.'
                    + '?item wdt:'+facet["Id"]+' ?u.'
                    + getCondition()
                    + ' }';
        wikidataAPI.sendQuery(query)
            .then(function(response){
                facet["fInterface"]["numberItems"]=response[0]["numberItems"].value;
            });

    }
    //for tree view

    //Run when initializing page: load index file or preprocessing statistic files
    var init = function () {

        wikidataIndex.getIndexFile().then(
            function(returnedData){
                $scope.indexData=returnedData;
            }
        );
        wikidataIndex.loadPropertyDataTypeStatistic().then(
            function(returnedData){
                $scope.propertyDataType=returnedData;
            }
        );

        /*
        utilities.getFacets().then(
            function(facetModel){
                $scope.facets=facetModel;
            }
        )*/
    };
    // and fire it after definition
    init();


});