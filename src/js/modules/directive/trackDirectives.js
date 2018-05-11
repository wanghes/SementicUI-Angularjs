import serviceModule from '../service/services';
import pNotify from '../service/pNotify';
import Utils from '../service/utils';

/****************导入公用组件******************/
import uiDropdown from './uiDropdown';
import uiMainBox from './uiMainBox';
import uiTab from './uiTab';
import uiTabBox from './uiTabBox';
import uiPageLoading from './uiPageLoading';
import uiGridLoading from './uiGridLoading';
import uiInputValidate from './uiInputValidate';
import uiDateRange from './uiDateRange';
import uiTopSearch from './uiTopSearch';
import uiTopSearchForm from './uiTopSearchForm';
import uiTopSearchedItems from './uiTopSearchedItems';
import uiButtonGroup from './uiButtonGroup';
import uiLeanModal from './uiLeanModal';
import uiSliderModal from './uiSliderModal';
import uiCity from './uiCity';
import uiRadio from './uiRadio';
import uiPopupContent from './uiPopupContent';
import uiTableIntro from './uiTableIntro';
import uiSearchComplete from './uiSearchComplete';
import uiTreeView from './uiTreeView'; /**树状tree**/
import uiConfirm from './uiConfirm'; 

/****************自定义组件****************/



let trackDirectiveModule = angular.module('trackDirectiveModule', ['serviceModule','ngSanitize']);

//生成trackDirectiveModule下所拥有的指令
trackDirectiveModule.directive('pageLoading',uiPageLoading);
trackDirectiveModule.directive('uiDropdown',
    function($timeout){
        return uiDropdown($timeout);
});

trackDirectiveModule.directive('treeView',
    function($timeout){
        return uiTreeView($timeout);
});

trackDirectiveModule.directive('mainBox',($timeout) => {
    return uiMainBox($timeout);
});
trackDirectiveModule.directive('tabBox',(services) => {
    return uiTabBox(services);
});
trackDirectiveModule.directive('uiRadio',uiRadio);

trackDirectiveModule.directive('tab',uiTab);
trackDirectiveModule.directive('uiTableIntro',uiTableIntro);
trackDirectiveModule.directive('topSearch',uiTopSearch);
trackDirectiveModule.directive('topSearchForm',uiTopSearchForm);
trackDirectiveModule.directive('uiSearchedItems',($timeout)=>{
    return uiTopSearchedItems($timeout);
});
trackDirectiveModule.directive('uiSearchComplete',(services,$timeout) => {
    return uiSearchComplete(services,$timeout);
});
trackDirectiveModule.directive('inputValidate',(pNotify) => {
    return uiInputValidate(pNotify);
});
trackDirectiveModule.directive('uiDateRange',function($timeout){
    return uiDateRange($timeout);
});
trackDirectiveModule.directive('buttonGroup',uiButtonGroup);


trackDirectiveModule.directive('leanModal',
    function($timeout,pNotify,services,$sce){
        return uiLeanModal($timeout,pNotify,services,$sce);
});

trackDirectiveModule.directive('uiSliderModal',
    function($timeout,pNotify,services,$sce){
        return uiSliderModal($timeout,pNotify,services,$sce);
});

trackDirectiveModule.directive('uiCity',function($timeout,pNotify,services){
        return uiCity($timeout,pNotify,services);
});

trackDirectiveModule.directive('gridLoading', uiGridLoading);
trackDirectiveModule.directive('uiConfirm', function($timeout){
        return uiConfirm($timeout);
});
trackDirectiveModule.directive('popupContent',uiPopupContent);



export default trackDirectiveModule;
