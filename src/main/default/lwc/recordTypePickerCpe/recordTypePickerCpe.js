import { api, LightningElement, track } from 'lwc';
import { 
    defaultProperties, 
    convertBooleanRealToFlow,
    convertBooleanFlowToReal 
} from 'c/cpeHelper';

export default class RecordTypePickerCpe extends LightningElement {
    @api
    get allInputVariables(){
        return this._allInputVariables;
    }
    set allInputVariables(val){
        this._allInputVariables = val;
    }
    @track _allInputVariables;

    @api
    get inputVariables(){
        return this._inputVariables;
    }
    set inputVariables(val){
        this._inputVariables = val;
    }
    @track _inputVariables;

    @api
    get builderContext(){
        return this._builderContext;
    }
    set builderContext(val){
        this._builderContext = val;
    }
    @track _builderContext;

    @api
    get automaticOutputVariables(){
        return this._automaticOutputVariables;
    }
    set automaticOutputVariables(val){
        this._automaticOutputVariables = val;
    }
    @track _automaticOutputVariables;

    @api
    get elementInfo(){
        return this._elementInfo;
    }
    set elementInfo(val){
        this._elementInfo = val;
    }
    @track _elementInfo;

    @track
    configuration = {...defaultProperties};

    @track
    previewConfig;

    _initialized = false;

    connectedCallback(){
        if (this._initialized){
            return;
        }
        
        this._inputVariables.forEach( input => {
            let cleanedInput = {...input};
            if (input.valueDataType === 'Boolean') { // transpose '$GlobalConstant strings to Booleans
                cleanedInput.value = convertBooleanFlowToReal(input.value);
            }
            if (input.name === 'showDescription') { //convert deprecated showDescription attribute to new hideDescriptions attribute
                cleanedInput.name = 'hideDescriptions';
                cleanedInput.value = !cleanedInput.value;
            }
            this.configuration[cleanedInput.name] = {...cleanedInput};
        });
        this._initialized = true;
    }

    handleValueChange(event){
        this.configuration[event.detail.name] = {
            name: event.detail.name,
            value: event.detail.newValue,
            valueDataType: event.detail.newValueDataType
        };
        this.notifyPropertyChange(
            event.detail.name,
            event.detail.newValue,
            event.detail.newValueDataType
        );
    };
    
    notifyPropertyChange = (name,newValue,newValueDataType) => {
        newValue = (newValueDataType === 'Boolean' ? convertBooleanRealToFlow(newValue) : newValue);
        this.dispatchEvent(new CustomEvent(
            'configuration_editor_input_value_changed', {
                 bubbles: true,
                 cancelable: false,
                 composed: true,
                 detail: {
                     name,
                     newValue,
                     newValueDataType
                 }
            }
        ));
    };

    get previewConfigPanelHeaderLabel(){
        return this._elementInfo?.apiName ?
            this._elementInfo.apiName : 'Record Type Picker';
    };

    handlePreviewOpen(){
        this.previewConfig = {...this.configuration};
        this.template.querySelector('c-configuration-modal').show();
    };

    handlePreviewChange(event){
        this.previewConfig[event.detail.name] = {
            name: event.detail.name,
            value: event.detail.newValue,
            valueDataType: event.detail.newValueDataType
        };
    };

    handlePreviewCancel(){
        this.template.querySelector('c-configuration-modal').hide();
    };

    handlePreviewSave(){
        Object.values(this.previewConfig).forEach(prop => {
            if (this.configuration[prop.name]?.value !== prop.value){

                this.configuration[prop.name].value = prop.value;

                this.notifyPropertyChange(
                    prop.name,
                    prop.value,
                    prop.valueDataType
                );
            }
        });
        this.template.querySelector('c-configuration-modal').hide();
    }
}