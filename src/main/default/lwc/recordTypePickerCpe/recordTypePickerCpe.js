import { api, LightningElement, track } from 'lwc';
import { defaultProperties } from 'c/cpeHelper';

export default class RecordTypePickerCpe extends LightningElement {
    @api
    get inputVariables(){
        return this._inputVariables;
    }
    set inputVariables(val){
        this._inputVariables = val;
    }
    _inputVariables;

    @api
    get builderContext(){
        return this._builderContext;
    }
    set builderContext(val){
        this._builderContext = val;
    }
    _builderContext;

    @api
    get elementInfo(){
        return this._elementInfo;
    }
    set elementInfo(val){
        this._elementInfo = val;
    }
    _elementInfo;

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
            this.configuration[input.name] = {...input};
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
                this.notifyPropertyChange(prop.name,prop.value,prop.valueDataType);
            }
        });
        this.template.querySelector('c-configuration-modal').hide();
    }
}