/**
 * Created by tintin on 6/16/2016.
 */

app.factory('wikidataAPI', function($http) {
    return {
        sendQuery: function(query){
            var urlSPARQL = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' +
                encodeURIComponent(query);
            var config={cache:true};
            return $http.get(urlSPARQL,config).then (
                function(response){
                    return response.data.results.bindings;
                },
                function(response){
                    /*
                    The response object has these properties:
                        data – {string|Object} – The response body transformed with the transform functions.
                        status – {number} – HTTP status code of the response.
                        headers – {function([headerName])} – Header getter function.
                        config – {Object} – The configuration object that was used to generate the request.
                        statusText – {string} – HTTP status text of the response.
                    */
                    throw response;
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