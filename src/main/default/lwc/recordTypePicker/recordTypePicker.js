import { api, LightningElement, wire } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import getRecordTypes from '@salesforce/apex/RecordTypePickerController.getRecordTypes';

import { generateUUID, reduceErrors } from 'c/recordTypePickerLwcUtils';

import pickerTemplate from './recordTypeVisualPicker.html';
import radioTemplate from './recordTypeRadioGroup.html';
import picklistTemplate from './recordTypePicklist.html';
import errorTemplate from './recordTypePickerError.html';

export default class RecordTypePicker extends LightningElement {

    @api get selectedRecordType(){
        return this._selectedRecordType;
    }
    _selectedRecordType;

    @api get availableRecordTypes(){
        return this._returnedRecordTypes;
    }
    _returnedRecordTypes;

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
    get sortOrder(){
        return this._sortOrder;
    }
    set sortOrder(val){
        this._sortOrder = val;
    }
    _sortOrder = 'ASC';

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
            // we'll use this to invert the order if _orderBy is set to descending, default to ascending
            const ORDER_INVERTER = this._orderBy === 'DESC' ? -1 : 1; 
            let returnData = [...data];
            this._returnedRecordTypes = returnData.sort(function(a,b) {
                const aName = a.Name.toLowerCase(); //Object.assign({},a).Name;
                const bName = b.Name.toLowerCase(); //Object.assign({},b).Name;

                if (aName < bName) {
                    return -1 * ORDER_INVERTER;
                }

                if (aName > bName) {
                    return 1 * ORDER_INVERTER;
                }

                return 0;
            });
            this._error = undefined;
        }
        if (error) {
            this._error = reduceErrors(error);
            this._returnedRecordTypes = undefined;
        }
    }

    get picklistOptions(){
        if (!this.hideDescriptions){
            return this.availableRecordTypes.map((rt) => {
                return {
                    value: rt.Id,
                    label: rt.Name,
                    description: rt.Description
                };
            });
        }
        
        return this.availableRecordTypes.map((rt) => {
            return {
                value: rt.Id,
                label: rt.Name
            };
        });
    }

    handleChange(event){
        if (this.displayType === 'picklist') {
            this._selectedValue = event.detail.value;
        } else {
            this.template.querySelector(`[data-id="${event.target.value}"]`).checked = true;
            this._selectedValue = event.target.value;
        }

        this._selectedRecordType = this.availableRecordTypes.find(
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
