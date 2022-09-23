import { api, LightningElement, track } from 'lwc';
import { defaultProperties } from 'c/cpeHelper';
import { reduceErrors } from 'c/recordTypePickerLwcUtils';
import getObjectsWithRecordTypes from '@salesforce/apex/RecordTypePickerController.getObjectsWithRecordTypes';

const DISPLAY_OPTIONS = [
    {value: 'picker',    label: 'Visual Picker'},
    {value: 'radio',     label: 'Radio Group'},
    {value: 'picklist',  label: 'Picklist'}
];

export default class RecordTypePickerCpeInputs extends LightningElement {


    @api
    get config(){
        return _config;
    }
    set config(value){
        this._config = {...value};
    }

    @track
    _config;
    
    _error;

    displayTypeOptions = DISPLAY_OPTIONS;
    objectsWithRecordTypes;
    
    defaults = {...defaultProperties};

    get label(){
        return this._config?.label.value ?? defaultProperties.label.value;
    };
    get objectApiName(){
        return this._config?.objectApiName.value ?? defaultProperties.objectApiName.value;
    };
    get displayType(){
        return this._config?.displayType.value ?? defaultProperties.displayType.value;
    };
    get showDescription() {
        return (this._config?.hideDescriptions.value ?? defaultProperties.hideDescriptions.value) === false;
    };
    get autoNavigateNext(){
        return this._config?.autoNavigateNext.value ?? defaultProperties.autoNavigateNext.value;
    };

    get variant(){
        return this.showDescription ? 'brand' : 'neutral';
    }

    connectedCallback(){
        getObjectsWithRecordTypes().then((data) => {
            this.objectsWithRecordTypes = data.map(object => {
                return {
                    value: object.QualifiedApiName,
                    label: object.MasterLabel,
                    description: object.QualifiedApiName
                };
            });
        })
        .catch((error) => {
            this._error = reduceErrors(error);
        });
    }

    handleStringChange(event){
        this.publishChange({
            name: event.target.dataset.attribute,
            newValue: event.detail.value,
            newValueDataType: 'String'
        });
    };

    handleBooleanChange(event){
        this.publishChange({
            name: event.target.dataset.attribute,
            newValue: (event.target.dataset.attribute === 'hideDescriptions') ? !event.target.checked : event.target.checked,
            newValueDataType: 'Boolean'
        });
    };

    publishChange(values){
        const valueChangeEvent = new CustomEvent('valuechange',
            { detail: {...values} }
        );
        this.dispatchEvent(valueChangeEvent);
        this._config[values.name] = {...values};
    };
}