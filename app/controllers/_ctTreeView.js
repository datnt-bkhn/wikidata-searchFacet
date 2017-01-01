

app.controller("ctTreeView", ['$scope', function($scope) {

    $scope.delete = function(data) {
        data.nodes = [];
    };


    $scope.add = function(data) {
        var post = data.nodes.length + 1;
        var newName = data.name + '-' + post;
        data.nodes.push({name: newName,nodes: []});
    };


    $scope.tree = [{name: "Node", nodes: []}];

    $scope.nodeSelected = function($event,category){
        //b$event.stopPropagation();
        //alert('This node is selected' + category.title);
    };
    $scope.ctToogleEvent = function (category){
        if(category.hideMenu){
            category.hideMenu=false;
        }
        else{
            category.hideMenu = true ;
        }
    };
    $scope.categories = [
        {
            title: 'Computers',
            categories: [
                {
                    title: 'Laptops',
                    hideMenu: true,
                    categories: [
                        {
                            title: 'Ultrabooks'
                        },
                        {
                            title: 'Macbooks',
                            categories:[
                                {
                                    title:'Paridokht'
                                },
                                {
                                    title:'Shahnaz',
                                    categories:[
                                        {
                                            title:'Sohrab'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'Desktops'
                },
                {
                    title: 'Tablets',
                    hideMenu:true,
                    categories: [
                        {
                            title: 'Apple'
                        },
                        {
                            title: 'Android'
                        }
                    ]
                }
            ]
        },

        {
            title: 'Printers'
        }
    ];

    $scope.facets = [
        {
            name: 'instance of',
            id: 'P31',
            value:[
                {
                    type: 'int',
                    value:'520'
                },
                {
                    type:'int',
                    value:'550'
                }
            ],
            qualifier:[
                {
                    type: 'int',
                    value: '120'
                },
                {
                    type: 'int',
                    value: '650'
                }
            ],
            reference:[
                {
                    type: 'string',
                    value: 'R120'
                },
                {
                    type: 'string',
                    value: 'R523'
                }
            ],
            facets: [
                {
                    hideMenu: true,
                    name: 'Laptops',
                    id: 'P32'
                }

            ]
        }
    ];
}]);