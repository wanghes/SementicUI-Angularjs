import serviceModule from '../service/services';
import pNotify from '../service/pNotify';
import Utils from '../service/utils';

/****************导入公用组件******************/
import uiFileInput from './uiFileInput';
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
import uiModal from './uiModal';
import uiSliderModal from './uiSliderModal';
import uiCity from './uiCity';
import uiRadio from './uiRadio';
import uiPopupContent from './uiPopupContent';
import uiTableIntro from './uiTableIntro';
import uiSearchComplete from './uiSearchComplete';
import uiTreeView from './uiTreeView'; /**树状tree**/
import uiConfirm from './uiConfirm';

/****************自定义组件****************/
let trackDirectiveModule = angular.module('trackDirectiveModule', ['serviceModule', 'ngSanitize', 'utilsModule']);

//生成trackDirectiveModule下所拥有的指令
uiPageLoading(trackDirectiveModule);
uiDropdown(trackDirectiveModule);
uiFileInput(trackDirectiveModule);
uiTreeView(trackDirectiveModule);
uiMainBox(trackDirectiveModule);
uiTabBox(trackDirectiveModule);
uiRadio(trackDirectiveModule);
uiTab(trackDirectiveModule);
uiTableIntro(trackDirectiveModule);
uiTopSearch(trackDirectiveModule);
uiTopSearchForm(trackDirectiveModule);
uiButtonGroup(trackDirectiveModule);
uiGridLoading(trackDirectiveModule);
uiCity(trackDirectiveModule);
uiConfirm(trackDirectiveModule);
uiTopSearchedItems(trackDirectiveModule);
uiSearchComplete(trackDirectiveModule);
uiInputValidate(trackDirectiveModule);
uiDateRange(trackDirectiveModule);
uiModal(trackDirectiveModule);
uiSliderModal(trackDirectiveModule);
uiPopupContent(trackDirectiveModule);


export default trackDirectiveModule;
