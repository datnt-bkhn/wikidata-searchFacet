
app.factory('queryManager', function(wikidataSharedData,wikidataConstant) {
    /*
    var getCondition=function(){
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
        _.each(wikidataSharedData.facets,function(facet){
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

        return queryQuery;
    }
    */
    var getConditionFromAllFacets=function(facets,rootVariable,level){
        //var rootVariable="?item";
        //var level=1;

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

        var classCondition=[];
        var classQuery='';
        if(level>1){
            _.each(facets["fClass"],function(eClass){
                if(eClass["isSelected"]==true){
                    classCondition.push("{" + rootVariable + " wdt:P31 wd:" + eClass["entityId"] + "}")
                }
            })
            if(classCondition.length>0) classQuery="{"+ classCondition.join(" Union ") + "}";
            queryQuery+=classQuery;
        }


        _.each(facets["fFacet"],function(facet){
            facetCondition=[];
            facetQuery='';
            iAny+=1;
            if(!facet["fProperty"]["isPropertyType"] ){
                facetValueCondition=[];
                facetValueQuery='';

                if(facet["fValues"]&& facet["fValues"]["values"]){
                    _.each(facet["fValues"]["values"],function(facetValue){
                        if(facetValue["isSelected"]){
                            var facetValueCondition_temp=[];
                            iStatement=iStatement+1;

                            if(facetValue["text"]=="Any"){
                                facetValueCondition_temp.push(rootVariable+ ' wdt:'+ facet["Id"] + ' ?Any'+level+'_'+iAny);
                                if(facet["fNextLevel"] && facet["fNextLevel"]["fFacet"]){
                                    var subQuery=getConditionFromAllFacets(facet["fNextLevel"], ' ?Any'+level+'_'+iAny, level+1);
                                    if(subQuery.length>0) facetValueCondition_temp.push(subQuery);
                                }

                            }
                            else{
                                facetValueCondition_temp.push(rootVariable+ ' wdt:'+ facet["Id"] + ' wd:'+facetValue["entityId"]);
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
                                                qualifierValueCondition.push('{?statement'+level+'_'+iStatement+' pq:'+ qualifier["qProperty"]["entityId"] + ' wd:'+qualifierValue["entityId"]+'}')
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
                                facetValueCondition_temp.push(rootVariable + ' p:' + facet["Id"] + ' ?statement'+level+'_'+iStatement);
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

        return queryQuery;
    }

    var getConditionFromInActiveFacets=function(facets,rootVariable,level){
        //var rootVariable="?item";
        //var level=1;

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

        _.each(facets,function(facet){
            facetCondition=[];
            facetQuery='';
            iAny+=1;
            if(!facet["fProperty"]["isPropertyType"] && ((facet["isActive"]==false && level==1) || (level>1))){
                facetValueCondition=[];
                facetValueQuery='';

                if(facet["fValues"]&& facet["fValues"]["values"]){
                    _.each(facet["fValues"]["values"],function(facetValue){
                        if(facetValue["isSelected"]){
                            var facetValueCondition_temp=[];
                            iStatement=iStatement+1;

                            if(facetValue["text"]=="Any"){
                                facetValueCondition_temp.push(rootVariable+ ' wdt:'+ facet["Id"] + ' ?Any'+level+'_'+iAny);
                                if(facet["fNextLevel"] && facet["fNextLevel"]["fFacet"]){
                                    var subQuery=getConditionFromInActiveFacets(facet["fNextLevel"]["fFacet"], ' ?Any'+level+'_'+iAny, level+1);
                                    facetValueCondition_temp.push(subQuery);
                                }

                            }
                            else{
                                facetValueCondition_temp.push(rootVariable+ ' wdt:'+ facet["Id"] + ' wd:'+facetValue["entityId"]);
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
                                                qualifierValueCondition.push('{?statement'+level+'_'+iStatement+' pq:'+ qualifier["qProperty"]["entityId"] + ' wd:'+qualifierValue["entityId"]+'}')
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
                                facetValueCondition_temp.push(rootVariable + ' p:' + facet["Id"] + ' ?statement'+level+'_'+iStatement);
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

        return queryQuery;
    }

    var getCPartSubQuery=function(){
        //return getConditionFromInActiveFacets(wikidataSharedData["facets"]["fFacet"],"?item",1);
        return getConditionFromAllFacets(wikidataSharedData["facets"],"?item",1);
    }

    var getSPartClassCondition=function(parentFacet){
        var result="";
        var classCondition=[];
        _.each(parentFacet["fNextLevel"]["fClass"], function(iClass){
            if(iClass["isSelected"]==true){
                classCondition.push("{?vAny "+ "wdt:P31 wd:"+iClass["entityId"]+"}\n");
            }
        });
        if(classCondition.length>0){
            result+="{" + classCondition.join(" UNION ") +"}\n";
        }
        return result;
    }


    var getSPartSubQuery_ShowFacet=function(parentFacet){
        if(parentFacet) {
            var result="";
            result+="?item wdt:"+ parentFacet["Id"] +" ?vAny.";
            result+=getSPartClassCondition(parentFacet);
            result+="?vAny ?facet ?value.\n";
            result+="?property wikibase:directClaim ?facet."
            return result;
        }
        else{
            // show facet in level 1
            var result="";
            result+="?item ?facet ?value.\n";
            result+="?property wikibase:directClaim ?facet."
            return result;
        }

    }

    var getSPartSubQuery_ShowFacetValue=function(currentFacet){
        if(currentFacet["level"]>1) {
            //do it for level 2
            var parentFacet=currentFacet["parent"];
            var result="";
            result+="?item wdt:"+ parentFacet["Id"] +" ?vAny.";
            result+=getSPartClassCondition(parentFacet);
            result+="?vAny wdt:" + currentFacet["Id"] + " ?facetValue.\n";

            return result;
        }
        else{
            // show facet in level 1
            var result="";
            result+="?item wdt:"+ currentFacet["Id"]  +" ?facetValue.\n";
            return result;
        }

    }

    var getSPartSubQuery_ShowQualifier=function(facet,facetValue){
        var result;
        if(facet["level"]==1){

        }
    }

    /*
        facet: parent of next level
     */
    var showFacetQuery=function(parentFacet){
        var query = wikidataSharedData.query["showFacetQuery"];
        var result = query.replace('$1$', wikidataSharedData.config.keyword)
            .replace('$c$', getCPartSubQuery())
            .replace('$s$', getSPartSubQuery_ShowFacet(parentFacet))
            .replace('$2$', wikidataSharedData.config.limitResultInSubQuery)
            .replace('$3$', wikidataSharedData.config.languageCode)
            .replace('$4$', wikidataSharedData.config.limitFacets);
        console.log("--showFacetQuery---\n");
        console.log(result);
        return result;
    }

    var showFacetValueQuery=function(currentFacet) {

        var query = wikidataSharedData.query["showFacetValueQuery"];
        var result = query.replace('$1$', wikidataSharedData.config.keyword)
            .replace('$3$', wikidataSharedData.config.limitResultInSubQuery)
            .replace('$4$', wikidataSharedData.config.limitFacetValue)
            .replace('$5$', wikidataSharedData.config.languageCode)
            .replace('$c$', getCPartSubQuery())
            .replace('$s$', getSPartSubQuery_ShowFacetValue(currentFacet));
        console.log("--showFacetValueQuery---\n");
        console.log(result);
        return result;
    }
    var showFacetValueMinMaxQuery=function(facet){
        var query=wikidataSharedData.query["showFacetValueMinMaxQuery"];
        var result=query.replace('$1$',wikidataSharedData.config.keyword)
            .replace('$2$',facet.Id)
            .replace('$c$',getCPartSubQuery());
        console.log(result);
        return result;
    }


    var showQualifierQuery=function(facet,facetValue){
        var result;
        if(facetValue["text"]=="Any"){
            var query = wikidataSharedData.query["showQualifierAnyQuery"];
            result = query.replace('$1$', wikidataSharedData.config.keyword)
                .replace('$2$', facet.Id)
                .replace('$3$', '1000000')
                .replace('$4$', facet.Id)
                .replace('$5$', wikidataSharedData.config.languageCode)
                .replace('$c$', getCPartSubQuery())
                ;
        }
        else {
            var query = wikidataSharedData.query["showQualifierQuery"];
            var result = query.replace('$1$', wikidataSharedData.config.keyword)
                .replace('$2$', facet.Id)
                .replace('$3$', facetValue.entityId)
                .replace('$4$', facet.Id)
                .replace('$5$', wikidataSharedData.config.languageCode)
                .replace('$c$', getCPartSubQuery());
        }
        console.log('--------show qualifier query-------');
        console.log(result);
        return result;

    }

    var showQualifierValueQuery=function(facet,facetValue,facetQualifier){
        var result;
        var propertyDataType=wikidataSharedData.mapPropertyDataType[facetQualifier["qProperty"]["entityId"]];

        if(facetValue["text"]=="Any"){
            if( propertyDataType==wikidataConstant.propertyDataType["Quantity"]
                || propertyDataType==wikidataConstant.propertyDataType["Time"]){

                var query = wikidataSharedData.query["showQualifierValueAnyMinMaxQuery"];
                 result = query.replace('$1$', wikidataSharedData.config.keyword)
                    .replace('$2$', facet.Id)
                    .replace('$3$', facetQualifier["qProperty"]["entityId"])
                    .replace('$c$', facetParser.getCondition());

            }
            else{
                var query = wikidataSharedData.query["showQualifierValueAnyQuery"];
                result = query.replace('$1$', wikidataSharedData.config.keyword)
                    .replace('$2$', facet.Id)
                    .replace('$3$', facetQualifier["qProperty"]["entityId"])
                    .replace('$4$', wikidataSharedData.config.languageCode)
                    .replace('$c$', getCPartSubQuery());
            }

        }
        else{
            //TODO:
        }
        console.log('--qualifier value-----');
        console.log(result);
        return result;
    }

    var showClassNextLevelQuery=function(facet){
        var query=wikidataSharedData.query["showClassNextLevelQuery"];
        var result=query.replace('$1$',wikidataSharedData.config.keyword)
            .replace('$2$',facet.Id)
            .replace('$3$','100000')
            .replace('$4$','5')
            .replace('$5$',wikidataSharedData.config.languageCode)
            .replace('$c$', getConditionFromAllFacets(wikidataSharedData["facets"],"?item",1));
        console.log(result);
        return result;
    }

    var reGenerateFacetQuery=function(){
        var query = wikidataSharedData.query["showFacetQuery"];
        var result = query.replace('$1$', wikidataSharedData.config.keyword)
            .replace('$c$', getConditionFromAllFacets(wikidataSharedData["facets"],"?item",1))
            .replace('$s$', getSPartSubQuery_ShowFacet(null))
            .replace('$2$', wikidataSharedData.config.limitResultInSubQuery)
            .replace('$3$', wikidataSharedData.config.languageCode)
            .replace('$4$', wikidataSharedData.config.limitFacets);
        console.log("--reGenerateFacetQuery---\n");
        console.log(result);
        return result;
    }


    var conditionPartInResultQuery="";
    var getConditionPartResultQuery=function(){
        var result=getConditionFromAllFacets(wikidataSharedData["facets"],"?item",1);
        return result;
    }

    var generateGetResultQuery=function(){
        var result="";
        var queryQuery=getConditionPartResultQuery();
        conditionPartInResultQuery="";

        conditionPartInResultQuery=
            'where \
            { \
            hint:Query hint:optimizer "None" .\
                ?item wdt:P31 wd:' + wikidataSharedData.config.keyword + '.\n';
        if(queryQuery.length>0){
            conditionPartInResultQuery+=queryQuery+ "\n" ;
        }
        conditionPartInResultQuery+=' SERVICE wikibase:label {bd:serviceParam wikibase:language "en" .}';
        conditionPartInResultQuery+= ' } \
        limit 50';

        result='select distinct ?item ?itemLabel ' + conditionPartInResultQuery;
        console.log("----result query---");
        console.log(result);

        return result;
    }

    var generateGetNumberResultQuery=function(){
        var result='select (count (distinct ?item) as ?numberItems) ' + conditionPartInResultQuery;
        console.log("----number result query---");
        console.log(result);

        return result;
    }
    return {
        showFacetQuery:showFacetQuery,
        showFacetValueQuery:showFacetValueQuery,
        showFacetValueMinMaxQuery:showFacetValueMinMaxQuery,
        showQualifierQuery:showQualifierQuery,
        reGenerateFacetQuery:reGenerateFacetQuery,
        showQualifierValueQuery:showQualifierValueQuery,
        showClassNextLevelQuery:showClassNextLevelQuery,
        generateGetResultQuery:generateGetResultQuery,
        generateGetNumberResultQuery:generateGetNumberResultQuery
    }

    /**
     * find active facet.
     * return root facet which isActive is true
     */
    var getActiveFacet=function(){
        var foundActiveFacet=_.find(wikidataSharedData.facets,function(iFacet){
            return iFacet["isActive"]==true;
        });
        return foundActiveFacet;
    }

    var getConditionFromActiveFacets=function(facet,rootVariable,level){

    }

});