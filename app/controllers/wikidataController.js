

app.controller('wikidataController', function($scope,$q,$http,wikidataAPI,config,
                                              wikidataIndex,utilities,wikidataSharedData,initialInterfaceGeneration,
                                                facetValueManager,qualifierManager) {
    $scope.keyword = "human";


    $scope.results=[];
    $scope.numberResults=0;
    var numberResultsQuery="";


    $scope.facets=[];
   /* $scope.changeSelectedValue=false;
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
    $scope.propertyDataType={};*/

    $scope.generateInitInterface =function() {
        //$scope.type = "http://www.wikidata.org/entity/" + $scope.config.keyword;
        //$scope.typeId = $scope.config.keyword;
        
        $scope.facets = [];

        wikidataSharedData.config.keyword="Q4022";
        //initialize object whenever users start to search
        wikidataSharedData.facets=[];
        $scope.facets = wikidataSharedData.facets;
        initialInterfaceGeneration.generateInterface(wikidataSharedData.config.keyword);
        
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
            facetValueManager.showFacetValue(facet);
            //}

        }
    }

    $scope.changeFacetValue =function($event,facet,facetValue){
        //show qualifiers
        qualifierManager.showQualifiers(facet,facetValue);
        //get new facets
        initialInterfaceGeneration.reGenerateFacet(facet,facetValue)
            .then (function(returnResult){
                //wikidataSharedData.facets=returnResult;
                //$scope.facets=wikidataSharedData.facets;
            });
        //show results
        getResults();
    }

    $scope.showQualifiers=function ($event,facet,facetValue){
        $event.stopPropagation();
        qualifierManager.showQualifiers(facet,facetValue);
    }

    $scope.showHideQualifierValue=function($event,facet,facetValue,facetQualifier){
        $event.stopPropagation();
        var qInterface=facetQualifier.qInterface;
        if(qInterface.isExpand){
            qInterface.isExpand=false;
            qInterface.iconText='+';
        }
        else{
            qInterface.isExpand=true;
            qInterface.iconText='-';
            qualifierManager.showQualifierValue(facet,facetValue,facetQualifier);
            /*
            if(qInterface.isInit){
                showQualifierValue(facetQualifier,facet);
            }
            */
        }
    }

   

    $scope.changeQualifierValue=function(qualifierValue,facetQualifier,facet){
        getResults();
    }


    $scope.showNextLevel=function($event,facet){

        if($event) $event.stopPropagation();
        facetValueManager.showNextLevel(facet);
        
    }
   
    $scope.generateFacetNextLevel=function($event,facet,fNextLevel){
        if($event) $event.stopPropagation();
        initialInterfaceGeneration.generateFacetNextLevel(facet,fNextLevel);
    }


    /*
     $scope.showResult =function(){
     getResults();

     };

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

     */


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
        console.log('------result query--------');
        console.log(resultQuery);
        
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



    

    

    var getResultQuery=function(){
        var resultQuery="";

        var queryCondition=[];
        var queryQuery='';

        var facetCondition=[];
        var facetQuery='';
        var facetValueCondition=[];
        var facetValueQuery='';
        var qualifierCondition=[];
        var qualifierQuery='';
        var qualifierValueCondition=[];
        var qualifierValueQuery='';
        var iStatement=0;
        var iAny=0;
        _.each($scope.facets,function(facet){
            facetCondition=[];
            facetQuery='';
            iAny+=1;
            if(!facet["fProperty"]["isPropertyType"]){
                facetValueCondition=[];
                facetValueQuery='';

                if(facet["fValues"]&& facet["fValues"]["values"]){
                    _.each(facet["fValues"]["values"],function(facetValue){
                        if(facetValue["isSelected"]){
                            var facetValueCondition_temp=[];
                            iStatement=iStatement+1;

                            if(facetValue["text"]=="Any"){
                                facetValueCondition_temp.push('?item wdt:'+ facet["Id"] + ' ?Any'+iAny);
                            }
                            else{
                                facetValueCondition_temp.push('?item wdt:'+ facet["Id"] + ' wd:'+facetValue["entityId"]);
                            }

                            qualifierCondition=[];
                            qualifierQuery='';

                            if(facetValue["fQualifiers"] && facetValue["fQualifiers"]["hasQualifiers"]){
                                _.each(facetValue["fQualifiers"]["hasQualifiers"],function(qualifier){
                                    qualifierValueCondition=[];
                                    qualifierValueQuery="";


                                    if(qualifier["qValues"] && qualifier["qValues"]["values"]){
                                        _.each(qualifier["qValues"]["values"],function(qualifierValue){
                                            if(qualifierValue["isSelected"]){
                                                qualifierValueCondition.push('{?statement'+iStatement+' pq:'+ qualifier["qProperty"]["entityId"] + ' wd:'+qualifierValue["entityId"]+'}')
                                            }
                                        })
                                    }

                                    if(qualifierValueCondition.length>0){
                                        qualifierValueQuery+="{"+ qualifierValueCondition.join(" \nUNION\n ") +"}";
                                        qualifierCondition.push(qualifierValueQuery);
                                    }
                                });
                            }

                            if(qualifierCondition.length > 0){
                                facetValueCondition_temp.push('?item p:' + facet["Id"] + ' ?statement'+iStatement);
                                qualifierQuery+=qualifierCondition.join(" \n ");
                                facetValueCondition_temp.push(qualifierQuery);
                            }
                            facetValueCondition.push( "{" + facetValueCondition_temp.join('.\n') + "}");
                        }
                    })
                }

                if(facetValueCondition.length>0){
                    facetValueQuery+=("{"+ facetValueCondition.join("\nUnion\n") +"}");
                    facetCondition.push(facetValueQuery);
                }
            }

            if(facetCondition.length >0 ){
                facetQuery+="{"+ facetCondition.join("\n") + "}";
                queryCondition.push(facetQuery);
            }
        });

        if(queryCondition.length >0){
            queryQuery+=queryCondition.join("\n");
        }

        var resultQuery=
        'where \
        { \
            ?item wdt:P31 wd:' + wikidataSharedData.config.keyword + '.\n';
        if(queryQuery.length>0){
            resultQuery+=queryQuery+ "\n" ;
        }
        resultQuery+= ' } \
        limit 50';

        numberResultsQuery='select (count (distinct ?item) as ?numberItems) '+resultQuery;
        resultQuery='select distinct ?item ' + resultQuery;
        $scope.runningQuery=resultQuery;

        return resultQuery;
    }






    //for tree view

    //Run when initializing page: load index file or preprocessing statistic files
    var init = function () {

        wikidataIndex.getIndexFile().then(
            function(returnedData){
                $scope.indexData=returnedData;
                wikidataSharedData.mapClassFacets=returnedData;
            }
        );
        wikidataIndex.loadPropertyDataTypeStatistic().then(
            function(returnedData){
                $scope.propertyDataType=returnedData;
                wikidataSharedData.mapPropertyDataType=returnedData;
            }
        );
        wikidataIndex.getQuery('qShowFacet.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowFacet"]=returnedData;
            }
        )
        wikidataIndex.getQuery('qShowFacetValueMinMax.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowFacetValueMinMax"]=returnedData;
                //console.log(returnedData);
            }
        )
        wikidataIndex.getQuery('qShowFacetValue.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowFacetValue"]=returnedData;
                //console.log(returnedData);
            }
        )
        wikidataIndex.getQuery('qShowQualifier.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowQualifier"]=returnedData;
                //console.log(returnedData);
            }
        )
        wikidataIndex.getQuery('qShowQualifier_Any.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowQualifier_Any"]=returnedData;
                //console.log(returnedData);
            }
        )
        wikidataIndex.getQuery('qShowQualifierValue_Any.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowQualifierValue_Any"]=returnedData;
                //console.log(returnedData);
            }
        )
        wikidataIndex.getQuery('qShowQualifierValueMinMax_Any.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowQualifierValueMinMax_Any"]=returnedData;
            }
        )
        wikidataIndex.getQuery('qShowNextLevelClass.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowNextLevelClass"]=returnedData;
            }
        )
        wikidataIndex.getQuery('qInitializeFacetNextLevel.txt').then(
            function(returnedData){
                wikidataSharedData.query["InitializeFacetNextLevel"]=returnedData;
            }
        )
    };
    // and fire it after definition
    init();


});