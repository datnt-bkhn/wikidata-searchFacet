app.factory('wikidataSharedData',function(){
    return {
        mapPropertyDataType: {},//to look up data type of property from id
        mapClassFacets:{},//to store facets of class which has many instances, for example Human
        facets:{},//facets to show in the interface
        config:{ //config parameter for system
            keyword: '',
            initClass:[
                {
                    uri:"",
                    entityId:"",
                    text:""
                }
            ],
            languageCode: 'en',
            limitInstances: 3000,
            limitFacets: 40,
            limitFacetValue:10,
            limitResultInSubQuery:2000000
            
        },
        query:{
            ShowFacetValue:''
        },
        loader:{
            isLoadingFacet:false
        }
    }
})