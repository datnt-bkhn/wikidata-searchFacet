/**
 * Created by tintin on 6/16/2016.
 */

app.factory('wikidataAPI', function($http) {
    return {
        sendQuery: function(query){
            var urlSPARQL = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' +
                encodeURIComponent(query);

            return $http.get(urlSPARQL).then (
                function(response){
                    return response.data.results.bindings;
                },
                function(error){
                    throw error;
                }
            );
        },
        sendQueryReturnParams: function(query,oParam1,oParam2){
            var urlSPARQL = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' +
                encodeURIComponent(query);

            return $http.get(urlSPARQL).then (
                function(response){
                    var result={};
                    result["data"]=response.data.results.bindings;
                    result["oParam"]=[];
                    result["oParam"].push(oParam1);
                    result["oParam"].push(oParam2);
                    return result;
                },
                function(error){
                    throw error;
                }
            );
        },
        sendLabelQuery: function(query,entityId){
            var urlSPARQL = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' +
                encodeURIComponent(query);

            return $http.get(urlSPARQL).then (
                function(response){
                    var result={};
                    result["data"]=response.data.results.bindings;
                    result["entityId"]=entityId;
                    return result;
                },
                function(error){
                    throw error;
                }
            );
        },
        getSuggestion: function(inputText,languageCode){
            /*var action="https://www.wikidata.org/w/api.php";
            var searchQuery={action:'wbsearchentities', search:keywords, format:'json'
                , language: languageCode, uselang: languageCode, type: 'item', continue: '0'};
            */
            var urlWiki='https://www.wikidata.org/w/api.php?action=wbsearchentities&search='+ inputText +'&format=json&language='+languageCode +
                '&uselang='+languageCode+'&type=item&continue=0&callback=JSON_CALLBACK';

            return $http.jsonp(urlWiki)
                .then(
                    function(response){
                        return response.data.search;
                    },
                    function(error){
                        return error;
                    }
                )
        }
    }

});