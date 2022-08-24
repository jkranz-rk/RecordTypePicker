import { api, LightningElement, track } from 'lwc';
import { configuration } from 'c/recordTypePickerUtils';

const DISPLAY_OPTIONS = [
    {value: 'picker',    label: 'Visual Picker'},
    {value: 'radio',     label: 'Radio Group'},
    {value: 'picklist',  label: 'Picklist'}
];

export default class RecordTypePickerCpe extends LightningElement {
    @api inputVariables;

    get inputVariables(){
        return this._values();
    }
    set inputVariables(value){
        this._values = value;
        this.initializeValues();
    }

    @api builderContext;
    @api elementInfo;

    _values;

    @track
    previewConfig = {
        displayType : 'picker',
        label : '',
        objectApiName : '',
        showDescription : undefined,
        autoNavigateNext : undefined
    };

    initializeValues(){
        console.log(JSON.parse(JSON.stringify(this.config)));
        console.log(JSON.parse(JSON.stringify(this._values)));
        if (this._values && this._values.length){
            this._values.forEach(input => {
                this.config[input.name].value = input.value;
                this.config[input.name].dataType = input.valueDataType;
            });
        }
    }

    @track config = configuration;

    get configHeaderLabel() {
        return this.elementInfo?.apiName ? 
            this.elementInfo.apiName : 'Record Type Picker';
    }
    
    get label() {
        return this.getInputVariable('label') ?? '';
    }

    get displayType() {
        return this.getInputVariable('displayType') ?? 'picker';
    }

    get objectApiName() {
        return this.getInputVariable('objectApiName') ?? '';
    }

    get showDescription() {
        //if (this.showDescription === undefined)
        return this.getInputVariable('showDescription') ?? false;
    }

    get autoNavigateNext() {
        return this.getInputVariable('autoNavigateNext') ?? false;
    }

    get previewDisplayType(){
        return this.previewConfig.displayType();
    }

    get displayTypeOptions(){
        return DISPLAY_OPTIONS;
    }

    label;

    getInputVariable(inputName){
        console.log(`Searching: ${inputName}`);
        let input = this.inputVariables.find(v => v.name === inputName)?.value;
        console.log(`Found: ${value}`);
        return input;
    }

    handleConfigureClick(){
        this.previewConfig = {...this.config};
        this.template.querySelector('c-configuration-modal').show();
    }

    handlePreviewSave(){
        this.config = {...this.previewConfig};
        this.previewConfig.forEach(prop => {
            console.log(`saving ${prop.name} (${prop.dataType}): ${prop.value}`);
            this.notifyChange(prop.name,prop.value,prop.dataType);
        });
        this.template.querySelector('c-configuration-modal').hide();
    }

    notifyChange(attr,val,type){
        console.log({attr,val,type});
        this.dispatchEvent( new CustomEvent(
            'configuration_editor_input_value_changed', {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: {
                    name: attr,
                    newValue : val,
                    newValueDataType: type
                }
            }
        ));
    }

    handleCancel(){
        this.template.querySelector('c-configuration-modal').hide();
    }

    handleConfigChange(event){
        console.log(`config ${event.detail.name} (${event.detail.type}) changed to ${event.detail.value}`);
        this.config[event.detail.name].value = event.detail.value;
        this.config[event.detail.name].dataType = event.detail.type;
        this.notifyChange(
            event.detail.name,
            event.detail.value,
            event.detail.type
        );
    }

    handlePreviewChange(event){
        this.previewConfig[event.detail.name].value = event.detail.value
        this.previewConfig[event.detail.name].dataType = event.detail.type;
    }

    connectedCallback(){

    }
}