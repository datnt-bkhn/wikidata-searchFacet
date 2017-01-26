app.factory('qualifierManager', function($http,utilities,wikidataAPI,wikidataConstant,wikidataSharedData,queryManager) {
    
    var showQualifier=function(facet,facetValue){
        var propertyId=facet["Id"];
        facetValue["fQualifiers"]={};
        facetValue["fQualifiers"]["isExpand"]=true;
        facetValue["fQualifiers"]["hasQualifiers"]=[];
        var facetQualifiersQuery=queryManager.showQualifierQuery(facet,facetValue);

        return wikidataAPI.sendQuery(facetQualifiersQuery).then(function(returnedQualifiersData){

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

    var showQualifierValue=function(facet,facetValue,facetQualifier) {
        var propertyDataType = wikidataSharedData.mapPropertyDataType[facetQualifier["qProperty"]["entityId"]];

        facetQualifier["qValues"] = {};
        facetQualifier["qValues"]["values"] = [];
        facetQualifier["qValues"]["dataType"] = propertyDataType;

        facetQualifier["qInterface"] = {};
        facetQualifier["qInterface"]["isExpand"] = true;
        facetQualifier["qInterface"]["iconText"] = '-';

        var qualifierValueQuery = queryManager.showQualifierValueQuery(facet, facetValue, facetQualifier);

        return wikidataAPI.sendQuery(qualifierValueQuery)
            .then(
                function (qualifierValuesResult) {
                    if (propertyDataType == wikidataConstant.propertyDataType["Quantity"]
                        || propertyDataType == wikidataConstant.propertyDataType["Time"]) {
                        _.each(qualifierValuesResult, function (qualifierValueResult) {

                            facetQualifier["qValues"]["dataType"] = propertyDataType;
                            facetQualifier["qValues"]["min"] = qualifierValueResult.minQualifierValue.value;
                            facetQualifier["qValues"]["max"] = qualifierValueResult.maxQualifierValue.value

                        })
                    }
                    else {
                        _.each(qualifierValuesResult, function (qualifierValueResult) {
                            var newQualifierValue = {};
                            newQualifierValue["numberItems"] = qualifierValueResult.numberItems.value;
                            newQualifierValue["uri"] = qualifierValueResult.qualifierValue.value;
                            newQualifierValue["entityId"] = utilities.getEntityId(qualifierValueResult.qualifierValue.value);
                            newQualifierValue["text"] = qualifierValueResult.qualifierValueLabel.value;
                            facetQualifier["qValues"]["values"].push(newQualifierValue);
                        })
                    }
                });
    }

    return {
        showQualifier: showQualifier,
        showQualifierValue:showQualifierValue
    }

});