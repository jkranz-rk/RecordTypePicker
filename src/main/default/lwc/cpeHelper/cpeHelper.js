const notifyPropertyChange = function(name,newValue,newValueDataType) {
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

/**
 * Documentation refers to a 'configuration_editor_input_value_deleted' event
 * but doesn't describe what it expects in the detail object. 
 * TODO: find out more about this, lol. until then, use value change to set
 * the value to null or an empty string
 */
// const notifyPropertyDelete = () => {};


/** 
 * when boolean balues are passed around in Flows, they're passed around as
 * these '$GlobalConstant' values
*/
const flowConstants = {
    BOOLEAN : {
        TRUE : '$GlobalConstant.True',
        FALSE : '$GlobalConstant.False'
    }
};

const convertBooleanFlowToReal = (boolVal) => {
    switch (boolVal) {
        case '$GlobalConstant.True':
            return true;
        case '$GlobalConstant.False':
            return false;
        default:
            return false;
    }
};

const convertBooleanRealToFlow = (boolVal) => {
    return boolVal ? '$GlobalConstant.True' : '$GlobalConstant.False';
};

const defaultProperties = {
    objectApiName : {
        name : 'objectApiName',
        value : null,
        valueDataType : 'String'
    },
    label : {
        name : 'label',
        value : 'Select a RecordType',
        valueDataType : 'String'
    },
    displayType : {
        name : 'displayType',
        value : 'picker',
        valueDataType : 'String'
    },
    hideDescriptions : {
        name : 'hideDescriptions',
        value : false,
        valueDataType : 'Boolean'
    },
    autoNavigateNext : {
        name : 'autoNavigateNext',
        value : false,
        valueDataType : 'Boolean'
    }
};

export {notifyPropertyChange, flowConstants, defaultProperties, convertBooleanFlowToReal, convertBooleanRealToFlow};