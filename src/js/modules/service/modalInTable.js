let modalInTableModule = angular.module('modalInTableModule', []);
modalInTableModule.factory('templateLoader', [
    '$compile',
    '$document',
    '$controller',
    '$http',
    '$q',
    '$rootScope',
    '$templateCache',
    function($compile, $document, $controller, $http, $q, $rootScope, $templateCache, $timeout) {
        return {
            load: fetchTemplate,
            compile: loadAndCompile
        };

        function fetchTemplate(url) {
            return $http.get(url, { cache: $templateCache })
                .then(function(response) {
                    return response.data && response.data.trim();
                });
        }

        function loadAndCompile(options) {
            var extend = angular.extend,
                options = extend({
                    template: '',
                    templateUrl: '',
                    scope: null,
                    controller: null,
                    locals: {},
                    appendTo: $document[0].body
                }, options || {});

            var templatePromise = options.templateUrl ?
                this.load(options.templateUrl) :
                $q.when(options.template);

            return templatePromise.then(function(template) {
                var controller;
                var scope = options.scope || $rootScope.$new();

                //Incase template doesn't have just one root element, do this
                var element = angular.element('<div>').html(template).contents();

                if (options.controller) {
                    controller = $controller(
                        options.controller,
                        extend(options.locals, {
                            $scope: scope
                        })
                    );
                    element.children().data('$ngControllerController', controller);
                }
                if (options.appendTo) {
                    angular.element(options.appendTo).append(element);
                }
                $compile(element)(scope);

                return {
                    element: element,
                    scope: scope
                };

            });
        }

    }
]);

modalInTableModule.factory('tableModal', [
    'templateLoader',
    function(templateLoader) {

        function createModal(modal,options) {
            modal.show = function() {
                $(modal.element).attr('id', options.nodeId);
                if(options.nodeWidth){
                   $(modal.element).attr('style', "width:" + options.nodeWidth);
                }

                if(options.openType=='modal'){
                     $(modal.element).modal({
                        autofocus: false,
                        context: "body",
                        closable: false,
                        duration: 200,
                        inverted: false,
                        transition: options.transition ? options.transition : "scale",
                        onApprove: function($element) {},
                        onHidden:function(){
                            if(options.hiddenCallback){
                                options.hiddenCallback();
                            }
                        }
                    }).modal('show');
                }else if(options.openType=='sidebar'){
                    $(modal.element).sidebar({
                        dimPage: true,
                        closable: !options.closable?false:true,
                        scrollLock: true,
                        transition:options.transition ? options.transition : 'overlay',
                        onHidden:function(){
                             if(options.hiddenCallback){
                                options.hiddenCallback();
                            }
                        }
                   }).sidebar('show');
                }
            };
            modal.hide = function() {
                if(options.openType=='modal'){
                    $(modal.element).modal('hide');
                }else if(options.openType=='sidebar'){
                    $(modal.element).sidebar('hide');
                }
            };
            return modal;
        }

        return {
            fromTemlateUrl: function fromTemlateUrl(url, options) {
                return templateLoader.compile({
                    templateUrl: url,
                    scope: options.scope
                }).then(function(modal) {
                    return createModal(modal,options);
                });

            }
        }
    }
]);


export default modalInTableModule;
