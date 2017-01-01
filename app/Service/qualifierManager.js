app.factory('qualifierManager', function($http,utilities,wikidataAPI,wikidataConstant,wikidataSharedData,facetParser) {


    var getQualifierQuery=function(facet,facetValue){

        if(facetValue["text"]=="Any"){
            var query = wikidataSharedData.query["ShowQualifier_Any"];
            var result = query.replace('$1$', wikidataSharedData.config.keyword)
                .replace('$2$', facet.Id)
                .replace('$3$', '30000')
                .replace('$4$', facet.Id)
                .replace('$5$', wikidataSharedData.config.languageCode)
                .replace('$c$', facetParser.getCondition());

            return result;
        }
        else {
            var query = wikidataSharedData.query["ShowQualifier"];
            var result = query.replace('$1$', wikidataSharedData.config.keyword)
                .replace('$2$', facet.Id)
                .replace('$3$', facetValue.entityId)
                .replace('$4$', facet.Id)
                .replace('$5$', wikidataSharedData.config.languageCode)
                .replace('$c$', facetParser.getCondition());

            return result;
        }
    }

    var getQualifierValueQuery=function(facet,facetValue,facetQualifier){
        var propertyDataType=wikidataSharedData.mapPropertyDataType[facetQualifier["qProperty"]["entityId"]];

        if(facetValue["text"]=="Any"){
            if( propertyDataType==wikidataConstant.propertyDataType["Quantity"]
                || propertyDataType==wikidataConstant.propertyDataType["Time"]){

                var query = wikidataSharedData.query["ShowQualifierValueMinMax_Any"];
                var result = query.replace('$1$', wikidataSharedData.config.keyword)
                    .replace('$2$', facet.Id)
                    .replace('$3$', facetQualifier["qProperty"]["entityId"])
                    .replace('$c$', facetParser.getCondition());
                return result;
            }
            else{
                var query = wikidataSharedData.query["ShowQualifierValue_Any"];
                var result = query.replace('$1$', wikidataSharedData.config.keyword)
                    .replace('$2$', facet.Id)
                    .replace('$3$', facetQualifier["qProperty"]["entityId"])
                    .replace('$4$', wikidataSharedData.config.languageCode)
                    .replace('$c$', facetParser.getCondition());
                return result;
            }

        }
    }

    var showQualifiers=function(facet,facetValue){
        var propertyId=facet["Id"];
        facetValue["fQualifiers"]={};
        facetValue["fQualifiers"]["isExpand"]=true;
        facetValue["fQualifiers"]["hasQualifiers"]=[];
        var facetQualifiersQuery=getQualifierQuery(facet,facetValue);
        console.log('--------show qualifier query-------');
        console.log(facetQualifiersQuery);

        wikidataAPI.sendQuery(facetQualifiersQuery).then(function(returnedQualifiersData){

            console.log('----number of qualifier-----');
            console.log(Object.keys(returnedQualifiersData).length);

            _.each(returnedQualifiersData,function(qualifierProperty){

                var propertyDataType=wikidataSharedData.mapPropertyDataType[utilities.getEntityId(qualifierProperty.qualifier.value)];

                if(propertyDataType==wikidataConstant.propertyDataType["Quantity"]
                    || propertyDataType==wikidataConstant.propertyDataType["Time"]
                    || propertyDataType==wikidataConstant.propertyDataType["Url"]
                    || propertyDataType==wikidataConstant.propertyDataType["String"]
                    || propertyDataType==wikidataConstant.propertyDataType["Monolingualtext"]
                    || propertyDataType==wikidataConstant.propertyDataType["WikibaseItem"]){

                    var newQualifier={};
                    newQualifier["numberItems"]=qualifierProperty.numberItems.value;
                    newQualifier["qProperty"]={};
                    newQualifier["qProperty"]["uri"]=qualifierProperty.qualifier.value;
                    newQualifier["qProperty"]["entityId"]=utilities.getEntityId(newQualifier["qProperty"]["uri"]);
                    newQualifier["qProperty"]["text"]=qualifierProperty.propertyLabel.value;
                    newQualifier["qInterface"]={};
                    newQualifier["qInterface"]["iconText"]="+";
                    newQualifier["qInterface"]["isExpand"]=false;
                    newQualifier["qInterface"]["isInit"]=true;

                    facetValue["fQualifiers"]["hasQualifiers"].push(newQualifier);
                }

            })
        })

    }

    var showQualifierValue=function(facet,facetValue,facetQualifier){
        var propertyDataType=wikidataSharedData.mapPropertyDataType[facetQualifier["qProperty"]["entityId"]];

        facetQualifier["qValues"]={};
        facetQualifier["qValues"]["values"]=[];
        facetQualifier["qValues"]["dataType"]=propertyDataType;

        facetQualifier["qInterface"]={};
        facetQualifier["qInterface"]["isExpand"]=true;
        facetQualifier["qInterface"]["iconText"]='-';
        
        var qualifierValueQuery=getQualifierValueQuery(facet,facetValue,facetQualifier);
        console.log('--qualifier value-----');
        console.log(qualifierValueQuery);


        if( propertyDataType==wikidataConstant.propertyDataType["Quantity"]
            || propertyDataType==wikidataConstant.propertyDataType["Time"]){

            wikidataAPI.sendQuery(qualifierValueQuery)
                .then(
                    function(qualifierValuesResult) {
                        _.each(qualifierValuesResult,function(qualifierValueResult){

                            facetQualifier["qValues"]["dataType"]=propertyDataType;
                            facetQualifier["qValues"]["min"]=qualifierValueResult.minQualifierValue.value;
                            facetQualifier["qValues"]["max"]=qualifierValueResult.maxQualifierValue.value

                        })
                    }
                );
        }
        else{
            wikidataAPI.sendQuery(qualifierValueQuery)
                .then(
                    function(qualifierValuesResult) {
                        _.each(qualifierValuesResult,function(qualifierValueResult){
                            var newQualifierValue={};
                            newQualifierValue["numberItems"]=qualifierValueResult.numberItems.value;
                            newQualifierValue["uri"]=qualifierValueResult.qualifierValue.value;
                            newQualifierValue["entityId"]=utilities.getEntityId(qualifierValueResult.qualifierValue.value);
                            newQualifierValue["text"]=qualifierValueResult.qualifierValueLabel.value;
                            facetQualifier["qValues"]["values"].push(newQualifierValue);
                        })
                    }
                );
        }

    }


    return {
        showQualifiers: showQualifiers,
        showQualifierValue:showQualifierValue
    }

});