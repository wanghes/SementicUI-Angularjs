export default function(services,$timeout){
    return {
        restrict:'E',
        template:`<div class="ui search search_complete">
                      <div class="ui icon input">
                        <input class="prompt" type="text" ng-model="titleInfo" placeholder={{placeholder}}>
                        <i class="search icon"></i>
                      </div>
                      <div class="results"></div>
                    </div>`,
        scope:{
        	placeholder:"@", //grouped 或者 inline
            searchValue:"=",
            apiUrl:"@",
            label:"@"
        },
        controller:function($scope){

        },
        link:function(scope,elem,attrs){

        	$timeout(() =>{
                let search_complete = elem.find('.search_complete');
                let API_TOKEN = services.apiToken;
                scope.titleInfo = ""
                search_complete.search({
                     onSelect:function(result, response){
                        scope.searchValue = result.value;
                        scope.titleInfo = result.title
                        return true;
                    },
                    showNoResults:true,
                    onSearchQuery:function(query){
                        //console.log(query)
                    },
                    error : {
                        noResults : '对不起，没有找到你要的结果！',
                    },
                    apiSettings: {
                        action:"search",
                        url: services[scope.apiUrl]+"?keyword={query}",
                        method:"get",
                        dataType:"json",
                        beforeXHR: function(xhr) {
                            xhr.setRequestHeader ('Accept', 'application/json');
                            xhr.setRequestHeader ('Content-Type', 'application/json');
                            xhr.setRequestHeader ('Authorization', API_TOKEN ? "Bearer "+ API_TOKEN :"");
                        },
                        beforeSend: function(settings) {
                            if(!settings.urlData.query){
                                return false;
                            }
                            return true;
                        },
                        onResponse: function(response) {
                            var newResponse = {
                                results : []
                            };

                            if(response.code==1){
                                angular.forEach(response.data,(item) =>{
                                    newResponse.results.push({
                                        title:item[scope.label],
                                        value:item.id
                                    })
                                })
                            }

                            return newResponse;
                        },
                    }
                });


        	},0)

        }
    }
}
