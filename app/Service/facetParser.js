
app.factory('facetParser', function(wikidataSharedData) {
    
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
    
    return {
        getCondition:getCondition
    }

});