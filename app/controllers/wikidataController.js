

app.controller('wikidataController', function($scope, $q, $http, wikidataAPI, config,
                                              wikidataIndex, utilities, wikidataSharedData, facetManager,
                                              facetValueManager, qualifierManager, queryManager) {
    $scope.keyword = "human";
    $scope.results=[];
    $scope.numberResults=0;

    $scope.facets=[];
    $scope.loader=wikidataSharedData["loader"];
    //eventName could be
    //showFacetValue,changeFacetValue,showQualifierValue,changeQualifierValue,showClassNextLevel,changeClassValue
    $scope.eventName="";
    $scope.errorMessage="";

    $scope.showFacet =function() {
        console.log("*********************   generate Init Interface   *********************\n");
        //wikidataSharedData.config.keyword="Q4022";
        //initialize object whenever users start to search
        setLoadingState(true);


        wikidataSharedData.facets=[];
        wikidataSharedData.facets["fClass"]=[];
        var classObject=wikidataSharedData.config.initClass[0];
        wikidataSharedData.facets["fClass"].push(classObject);

        $scope.facets = wikidataSharedData.facets;
        facetManager.showFacet(wikidataSharedData.config.keyword)
            .then (function(){
                setLoadingState(false);
            });
        
        getResults();

    }

    $scope.showFacetValue=function($event, facet){
        console.log("*********************   showFacetValue  *********************\n");
        $event.stopPropagation();

        updateActiveFacet(facet);

        if(facet["level"]==1){
        _.each(wikidataSharedData.facets["fFacet"],function(iFacet){
                if(iFacet["Id"]!=facet["Id"])
                    iFacet["fInterface"]["isExpand"] = false;
            });
            facet["fInterface"]["isExpand"] = !facet["fInterface"]["isExpand"];
        }

        if(facet["level"]==2){
            //get parent to access other facets in the same level
            var parent=facet["parent"];
            _.each(parent["fNextLevel"]["fFacet"],function(iFacet){
                if(iFacet["Id"]!=facet["Id"])
                    iFacet["fInterface"]["isExpand"] = false;
            })
            facet["fInterface"]["isExpand"] = !facet["fInterface"]["isExpand"];
        }

        setLoadingState(true);

        facetValueManager.showFacetValue(facet)
            .then (function(){
                setLoadingState(false);
            });

    }

    $scope.changeFacetValue =function($event,facet,facetValue){
        console.log("*********************   changeFacetValue    *********************\n");
        if($event){$event.stopPropagation()};

        updateActiveFacet(facet);

        setLoadingState(true);
        //show qualifiers
        var promiseQualifier=qualifierManager.showQualifier(facet,facetValue);
        //get new facets
        var promiseFacet=facetManager.reGenerateFacet(facet,facetValue);
        $q.all([promiseQualifier,promiseFacet]).then(
            function(){
                setLoadingState(false);
            }
        );
        //show results
        getResults();
    }

    $scope.showQualifierValue=function($event, facet, facetValue, facetQualifier){
        console.log("*********************      showQualifierValue        *********************\n");
        if($event) $event.stopPropagation();

        updateActiveFacet(facet);
        setLoadingState(true);
        var qInterface=facetQualifier.qInterface;
        if(qInterface.isExpand){
            qInterface.isExpand=false;
            qInterface.iconText='+';
        }
        else{
            qInterface.isExpand=true;
            qInterface.iconText='-';
        }
        return qualifierManager.showQualifierValue(facet,facetValue,facetQualifier).then(
            function(){
                setLoadingState(false);
            }
        );
    }

    $scope.changeQualifierValue=function(qualifierValue,facetQualifier,facet){
        console.log("*********************        changeQualifierValue            *********************\n");
        updateActiveFacet(facet);
        //TODO: update number of other qualifier
        //regenerate other qualifiers
        getResults();
        
    }

    $scope.showClassNextLevel=function($event, facet){

        console.log("*********************          showClassNextLevel          *********************\n");
        if($event) $event.stopPropagation();

        updateActiveFacet(facet);
        setLoadingState(true);
        return facetManager.showClassNextLevel(facet).then(
            function(){
                setLoadingState(false);
            }
        );
        
    }
   
    $scope.showFacetNextLevel=function($event, facet, fNextLevel){

        console.log("*********************           showFacetNextLevel           *********************\n");

        if($event) $event.stopPropagation();

        updateActiveFacet(facet);
        setLoadingState(true);
        setErrorMessage("");

        facetManager.showFacetNextLevel(facet,fNextLevel)
            .then(function() {
                setLoadingState(false);
            })
            .catch(function(error) {
                setLoadingState(false);
                setErrorMessage(error.errorMessage);
            });
        //TODO: update facet
    }

    var getResults=function(){
        $scope.results=[];

        var resultQuery=queryManager.generateGetResultQuery();

        var numberResultQuery=queryManager.generateGetNumberResultQuery();

        wikidataAPI.sendQuery(resultQuery)
            .then(
                function(result){
                    $scope.results=result;
                    $scope.loader.isLoadingResult=false;
    }
            );
        //get number results of query

        wikidataAPI.sendQuery(numberResultQuery)
            .then(
                function(result){
                    $scope.numberResults=result[0]["numberItems"].value;
                    $scope.loader.isLoadingNumberResult=false;
                }
            );

    }

    /**
     * set which facet is currently active by user.
     * Two steps:
     * set false every facet. //Add set false to child facet
     * set true the current facet in specific level
     * set true to the parent of the active facet
     */
    var updateActiveFacet=function(facet){

        var foundFacet=_.find($scope.facets["fFacet"],function(eFacet){
            return eFacet["isActive"]==true;
        });
        if(foundFacet) {
            foundFacet["isActive"]=false;
            //set false to next level facet
            while(foundFacet["fNextLevel"]){
                foundFacet["fNextLevel"]["fInterface"]["isActiveShowLevel"]=false;
                foundFacet=foundFacet["fFacet"];
                if(!foundFacet) break;
            }
        }

        facet["isActive"]=true;
        var parentFacet=facet["parent"]
        while(parentFacet){
            parentFacet["isActive"]=true;
            parentFacet=parentFacet["parent"];
        }
    }

    //TODO: how the app is loaded after asynchronous calls are finished?
    //http://stackoverflow.com/questions/16286605/angularjs-initialize-service-with-asynchronous-data
    //Run when initializing page: load index file or preprocessing statistic files
    var init = function () {
        var nameQueries=["showFacetQuery","showFacetValueQuery","showFacetValueMinMaxQuery",
            "showQualifierQuery","showQualifierAnyQuery","showQualifierValueAnyQuery",
            "showQualifierValueAnyMinMaxQuery","showClassNextLevelQuery"];
        _.each(nameQueries,function(iNameQuery){
            wikidataIndex.getQuery(iNameQuery+'.txt').then(
                function(returnedData){
                    wikidataSharedData.query[iNameQuery]=returnedData;
                }
            )
        })

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
        /*
        wikidataIndex.getQuery('qShowFacet.txt').then(
            function(returnedData){
                wikidataSharedData.query["ShowFacet"]=returnedData;
            }
        )
        wikidataIndex.getQuery('showFacetQuery.txt').then(
            function(returnedData){
                wikidataSharedData.query["showFacetQuery"]=returnedData;
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
        */
    };
    // and fire it after definition
    init();

    $scope.updateNumber=function(facet){
        var a=1;
        console.log(facet.fValues.min);
    }
    var getResultQuery=function(){
        var queryQuery=queryManager.getCondition();
        var numberResultsQuery="";
        numberResultsQuery='select (count (distinct ?item) as ?numberItems) '+resultQuery;
        resultQuery='select distinct ?item ' + resultQuery;
        $scope.runningQuery=resultQuery;

        return resultQuery;
    }
    /*
     $scope.showQualifier=function ($event,facet,facetValue){
     $event.stopPropagation();

     updateActiveFacet(facet);

     qualifierManager.showQualifier(facet,facetValue);
     }
     */

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

     $scope.addFacetValueCondition=function($event,fValues){
     var newValue={};
     newValue["condition"]="<=";
     newValue["threshold"]="1995";
     newValue["isSelected"]=true;
     fValues.values.push(newValue);
     }
     */
     var setLoadingState=function(state){
         $scope.loader.isLoadingFacet=state;
         //$scope.loader.isLoadingResult=state;
         //$scope.loader.isLoadingNumberResult=state;
     }
    var setErrorMessage=function(message){
        $scope.errorMessage=message;
    }

});