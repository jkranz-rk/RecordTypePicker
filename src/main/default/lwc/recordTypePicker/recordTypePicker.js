import { api, LightningElement, wire } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import getRecordTypes from '@salesforce/apex/RecordTypePickerController.getRecordTypes';

import { generateUUID, reduceErrors } from 'c/recordTypePickerLwcUtils';

import pickerTemplate from './recordTypeVisualPicker.html';
import radioTemplate from './recordTypeRadioGroup.html';
import picklistTemplate from './recordTypePicklist.html';
import errorTemplate from './recordTypePickerError.html';

export default class RecordTypePicker extends LightningElement {

    @api selectedRecordType;
    @api availableRecordTypes;

    @api objectApiName;

    @api
    get label(){
        return this._label;
    }
    set label(val){
        this._label = val;
    }
    _label = 'Select a Record Type';

    @api
    get autoNavigateNext(){
        return this._autoNavigateNext;
    }
    set autoNavigateNext(val){
        this._autoNavigateNext = val;
    }
    _autoNavigateNext = false;

    @api
    get hideDescriptions(){
        return this._hideDescriptions;
    }
    set hideDescriptions(val){
        this._hideDescriptions = val;
    }
    _hideDescriptions;

    @api
    get displayType(){
        return this._displayType;
    }
    set displayType(val){
        this._displayType = val?.toLowerCase();
    }
    _displayType = 'picker';

    @api
    get mode(){
        return this._mode;
    }
    set mode(val){
        this._mode = val?.toLowerCase();
    }
    _mode = 'live';

    // deprecated in favor of hideDescriptions, since we want the default
    // value to be `True`, its a bad practice to set boolean defaults to `True`
    @api showDescription; 

    _error;
    _selectedValue;

    uuid;

    get isPreview() {
        return this._mode === 'preview';
    }

    render(){
        if (this._error) {
            return errorTemplate;
        }
        switch(this._displayType){
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
        if (this.recordTypes.data && this.recordTypes.data.length === 0){
            this._error = 'You must select an Object that has active Record Types';
        }

        if (!this.uuid) {
            this.uuid = generateUUID();
        }
    }

    @wire(getRecordTypes, { sObjectApiName : '$objectApiName'})
    recordTypes({ error,data }) {
        if (data) {
            this.availableRecordTypes = data;
            this._error = undefined;
        }
        if (error) {
            this._error = reduceErrors(error);
            this.availableRecordTypes = undefined;
        }
    };

    get picklistOptions(){
        if (!this.hideDescriptions){
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

        if (this.autoNavigateNext && !this.isPreview){
            this.navigateNext();
        }
    } 

    navigateNext(){
        this.dispatchEvent(new FlowNavigationNextEvent());
    }
}
