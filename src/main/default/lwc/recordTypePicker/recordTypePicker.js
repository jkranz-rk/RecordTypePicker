import { api, LightningElement, wire } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import getRecordTypes from '@salesforce/apex/RecordTypePickerController.getRecordTypes';

import { generateUUID, reduceErrors } from 'c/recordTypePickerLwcUtils';

import pickerTemplate from './recordTypeVisualPicker.html';
import radioTemplate from './recordTypeRadioGroup.html';
import picklistTemplate from './recordTypePicklist.html';

export default class RecordTypePicker extends LightningElement {

    @api objectApiName;
    @api label = 'Select a Record Type';
    @api selectedRecordType;
    @api availableRecordTypes;
    @api autoNavigateNext = false;
    @api showDescription;
    @api displayType = 'picker';

    @api mode = 'live';

    _error;
    _selectedValue;

    uuid;

    get isPreview() {
        return this.mode.toLowerCase() === 'preview';
    }

    render(){
        switch(this.displayType.toLowerCase()){
            case 'picker':
                return pickerTemplate;
            case 'radio' :
                return radioTemplate;
            case 'picklist' :
                return picklistTemplate;
            default :
                return pickerTemplate;
        }
    }

    connectedCallback(){
        if (this.isPreview && !this.availableRecordTypes){
            this.availableRecordTypes = previewRecordTypes;
        }

        if (!this.uuid) {
            this.uuid = generateUUID();
        }
    }

    @wire(getRecordTypes, { sObjectApiName : '$objectApiName'})
    recordTypes({ error,data }) {
        if (data && !this.isPreview) {
            console.log(JSON.parse(JSON.stringify(data)));
            this.availableRecordTypes = data;
            this._error = undefined;
        }
        if (error) {
            this._error = reduceErrors(error);
            this.availableRecordTypes = undefined;
        }
    };

    get picklistOptions(){
        if (this.showDescription){
            return this.availableRecordTypes.map((rt) => {
                return {
                    value: rt.Id,
                    label: rt.Name,
                    description: rt.Description
                };
            });
        } else {
            return this.availableRecordTypes.map((rt) => {
                return {
                    value: rt.Id,
                    label: rt.Name
                };
            });
        }
        
    }

    handleChange(event){
        if (this.displayType === 'picklist') {
            this._selectedValue = event.detail.value;
        } else {
            this.template.querySelector(`[data-id="${event.target.value}"]`).checked = true;
            this._selectedValue = event.target.value;
        }

        this.selectedRecordType = this.availableRecordTypes.find(
            rt => rt.Id === this._selectedValue
        );

        this.dispatchEvent(
            new FlowAttributeChangeEvent('selectedRecordType',this.selectedRecordType)
        );

        if (this.autoNavigateNext){
            this.navigateNext();
        }
    } 

    navigateNext(){
        this.dispatchEvent(new FlowNavigationNextEvent());
    }
}
