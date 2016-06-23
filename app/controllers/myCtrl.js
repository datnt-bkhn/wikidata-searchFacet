

app.controller('myCtrl', function($scope,$q,$http,wikidataAPI,config) {
    $scope.keyword = "human";
    $scope.search=function(){
        //var query ="select ?u where {?u wdt:P31 wd:Q5.} limit 100";
        var query='select ?u ?uLabel where {wd:Q5 wdt:P1963 ?u .  SERVICE wikibase:label {bd:serviceParam wikibase:language "en" .}} limit 10 offset 1';
        sendQuery(query);
    }

    $scope.results=[];
    $scope.facets=[];
    
    $scope.type="http://www.wikidata.org/entity/Q4022";
    $scope.language="en";
    $scope.limitFacets=10;
    $scope.limitInstances=1000;

    $scope.config=config;
    
    $scope.generateInitInterface =function() {
        $scope.type="http://www.wikidata.org/entity/"+$scope.config.keyword;
        $scope.facets=[];
        var initInterfaceQuery=getInitInterfaceQuery();

        wikidataAPI.sendQuery(initInterfaceQuery)
        .then(
            function (initInterfaceResult){
                /*_.each(initInterfaceResult,function(element){
                    var property=element.facet.value;
                    var numberFound=element.numberFound.value;

                    var propertyLabelQuery=getPropertyLabelQuery(property);
                    wikidataAPI.sendQuery(propertyLabelQuery)
                    .then(
                        function(propertyLabelResult){
                            var newFacet={};
                            newFacet.text=propertyLabelResult[0].propertyLabel.value;
                            newFacet.fullLink=property;
                            newFacet.number=numberFound;
                            newFacet.id=property.substring(property.lastIndexOf("/")+1,property.length);
                            newFacet.isExpand=false;
                            newFacet.iconText='+';
                            newFacet.isFirstInit=true;
                            //console.log(newFacet.id);
                            $scope.facets.push(newFacet);
                        },
                        function(error){
                            console.log('error propertyLabelQuery'+error);
                        }
                    );
                });
                */
                var promises=[];
                _.each(initInterfaceResult,function(element){
                    var property=element.facet.value;
                    var numberFound=element.numberFound.value;
                    var propertyLabelQuery=getPropertyLabelQuery(property);
                   promises.push(wikidataAPI.sendQuery(propertyLabelQuery));
                });
                $q.all(promises).then(function(data){
                   _.each(data,function(propertyLabelResult,index){
                       var newFacet={};
                       var property=initInterfaceResult[index].facet.value;
                       var numberFound=initInterfaceResult[index].numberFound.value;
                       newFacet.text=propertyLabelResult[0].propertyLabel.value;
                       newFacet.fullLink=property;
                       newFacet.number=numberFound;
                       newFacet.id=property.substring(property.lastIndexOf("/")+1,property.length);
                       newFacet.isExpand=false;
                       newFacet.iconText='+';
                       newFacet.isFirstInit=true;
                       //console.log(newFacet.id);
                       $scope.facets.push(newFacet);
                   })
                });
            },
            function (error){
                console.log('error initInterfaceQuery'+error);
            }
        );



    }

    var showFacetValue = function($event,facet){
        $event.stopPropagation();
        var facetValue=[];
        var facetValueQuery='select ?facetValue (count (?facetValue) as ?numberInstances) \
        where \
        { \
            ?item wdt:P31 <'+ $scope.type +'>. \
            ?item <'
            + facet.fullLink
            + '> ?facetValue \
        } \
        group by ?facetValue \
            order by DESC (?numberInstances) \
        limit 5';

        wikidataAPI.sendQuery(facetValueQuery)
        .then(
            function(facetValueResult){

                _.each(facetValueResult,function(element) {
                    //facetValue.push({type:'String',value:element.u.value,isCheck:true});
                    var fullLink=element.facetValue.value;
                    var number=element.numberInstances.value;
                    itemLabelQuery=getItemLabelQuery(element.facetValue.value);
                    wikidataAPI.sendQuery(itemLabelQuery)
                    .then(
                        function(itemLabelResult){
                            var newFacetValue={};
                            if(itemLabelResult[0]){
                                newFacetValue.text=itemLabelResult[0].itemLabel.value;
                            }
                            else{
                                newFacetValue.text=getEntityId(fullLink)
                            }
                            newFacetValue.fullLink=fullLink;
                            newFacetValue.number=number;
                            newFacetValue.isCheck=false;
                            facetValue.push(newFacetValue);
                        }
                    )
                });
                facet.value=facetValue;
            }
        );


    };

    $scope.ctToogleEvent = function ($event,facet){
        $event.stopPropagation();
        if(facet.isExpand){
            facet.isExpand=false;
            facet.iconText='+';
            return;
        }
        else{
            facet.isExpand=true;
            facet.iconText='-';
            if(facet.isFirstInit){
                showFacetValue($event,facet);
            }

        }
    };

    $scope.showResult =function(){
        var strQuery=[];
        $scope.results=[];

        _.each($scope.facets,function(facet){
            var property=facet.fullLink;
            _.each(facet.value,function(facetValue){
               if(facetValue.isCheck){
                strQuery.push( '{?item <'+property+'> <'+facetValue.fullLink+'>}');
               }
            });

        });

        var query='select ?item \
        where \
        { \
            ?item wdt:P31 <' + $scope.type + '>. \
            {?item wdt:P17 wd:Q159} \
            UNION \
            {?item wdt:P17 wd:Q155} \
        } \
        limit 50';

        var resultQuery='select ?item \
        where \
        { \
            ?item wdt:P31 <' + $scope.type + '>.'
            + strQuery.join(" UNION ")
        +' } \
        limit 50';


        wikidataAPI.sendQuery(resultQuery)
        .then(
            function(result){
                $scope.results=result;
            }
        );

    };

    var getInitInterfaceQuery=function(){
        var query='Select ?facet (count (?facet) as ?numberFound) \
            where { \
             hint:Query hint:optimizer "None" . \
            { select ?item  where { ?item wdt:P31 <'+ $scope.type + '>. } limit ' + $scope.limitInstances + '  } \
            ?item ?facet ?value. \
             filter strstarts(str(?facet),"http://www.wikidata.org/prop/direct") \
             } \
            group by ?facet  \
            order by DESC (?numberFound) \
            limit ' + $scope.limitFacets;
        return query;
    }

    var getPropertyLabelQuery=function (property){
        var query='SELECT ?propertyLabel \
                    WHERE \
                    { \
                        ?property ?ref <' + property + '>.'
                        + '  ?property rdfs:label ?propertyLabel. FILTER (lang(?propertyLabel) = "'+$scope.language+'") \
                    }';
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

    var getItemLabel=function(item){

    }

    //for tree view


    $scope.reGenerateInterface=function(){
      console.log($scope.facets);
    };

    $scope.showQualifier =function ($event,facet){
        $event.stopPropagation();
        var query='';
    }


});