describe('WikishareData', function() {

    var $scope, $q, $http, wikidataAPI, config,
        wikidataIndex, utilities, wikidataSharedData, facetManager,
        facetValueManager, qualifierManager, queryManager;
    var controller;
    // Load our api.users module
    beforeEach(function(){
        var u=1;
        module('myApp');
        inject(function($controller,_$q_, _$http_, _wikidataAPI_, _config_,
                        _wikidataIndex_, _utilities_, _wikidataSharedData_, _facetManager_,
                        _facetValueManager_, _qualifierManager_, _queryManager_) {
            controller=$controller;
            $q=_$q_;
            $http=_$http_;
            wikidataAPI=_wikidataAPI_;
            config=_config_;
            wikidataIndex=_wikidataIndex_;
            utilities=_utilities_;
            wikidataSharedData=_wikidataSharedData_;
            facetManager=_facetManager_;
            facetValueManager=_facetValueManager_;
            qualifierManager=_qualifierManager_;
            queryManager=_queryManager_;
        });
    });

    it('test http', function() {
        var $scope={};
        var deferred;
        deferred = $q.defer();
        spyOn(wikidataIndex, 'getQuery').and.returnValue(deferred.promise);
        deferred.resolve();
        $scope.$apply();
        
    });


    it('should exist 123', function(done) {
        var $scope={};
        var wikidataController=controller('wikidataController',
            {
                $scope:$scope,$q:$q, $http:$http, wikidataAPI:wikidataAPI, config:config,
                wikidataIndex:wikidataIndex, utilities:utilities, wikidataSharedData:wikidataSharedData, facetManager:facetManager,
                facetValueManager:facetValueManager, qualifierManager:qualifierManager, queryManager:queryManager
            });
        $scope.$apply();
        var abc={};
        $scope.showFacet(function(){
            var u=wikidataSharedData.facets;
            done();
        });

    });

    // A simple test to verify the Users service exists
    it('should exist', function() {
        wikidataSharedData.config.keyword="Q4022";
        facetManager.showFacet(wikidataSharedData.config.keyword)
            .then (function() {
                var u=1;
            })
        expect(wiki).toBeDefined();
    });

});