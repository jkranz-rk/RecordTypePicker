import { api, LightningElement } from 'lwc';

const DISPLAY_OPTIONS = [
    {value: 'picker',    label: 'Visual Picker'},
    {value: 'radio',     label: 'Radio Group'},
    {value: 'picklist',  label: 'Picklist'}
];

export default class RecordTypePickerCpeInputs extends LightningElement {

    @api config;
    get config(){
        return _config;
    }
    set config(value){
        console.log(value);
        this._config = value;
    }

    _config;

    get label(){
        return this._config.label.value;
    };
    get objectApiName(){
        return this._config.objectApiName.value;
    };
    get displayType(){
        return this._config.displayName.value;
    };
    get showDescription() {
        return this._config.showDescription.value;
    };
    get autoNavigateNext(){
        return this._config.autoNavigateNext.value;
    };

    displayTypeOptions = DISPLAY_OPTIONS;

    handleChange(event){
        const type = event.target.dataset.type;
        let value;
        if (type === 'String'){
            value = event.target.value;
        } else if (type === 'Boolean'){
            value = event.target.checked;
        }
        const valueChangeEvent = new CustomEvent('valuechange',
            { 
                detail: {
                    name: event.target.dataset.attribute,
                    value: value,
                    type: type
                }
            }
        );
        console.log(valueChangeEvent);
        this.dispatchEvent(valueChangeEvent);
    }

}