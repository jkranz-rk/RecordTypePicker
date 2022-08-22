@SuppressWarnings('PMD')
public with sharing class RecordTypePickerController {

    /**
     * 
     */
    @AuraEnabled(cacheable=true)
    public static List<RecordType> getRecordTypes(String sObjectApiName) {
    
        Set<Id> availableRTForSelectedObject = RecordTypePickerController.availableRecordTypeIdsFromObjectApiNames(
            New List<String>{ sObjectApiName }
        );

        return [ SELECT Id, Name, Description, DeveloperName 
                 FROM RecordType 
                 WHERE Id IN :availableRTForSelectedObject];
    }


    /* 
     * In order to provide a way to give the admin a collection of Record Types 
     * that are available to the current running user in a way that is not coupled
     * with the LWC Record Type Picker Flow Screen component, we offer this invocable method
     * 
     * This method is only intended to be used in Screen Flows, and should therefore
     * only ever be called with one request in its list. I couldn't bring myself to 
     * not make it bulkified, though. 
     * 
     * Since it IS bulkified, it technically can work on bulk transactions, but
     * it hasn't been tested for performance at scale, nor what side effects there
     * might be from running this in the context of automated users
     * 
     * Hopefully some day we'll get the ability to control which Flow Builder environments
     * a particular invocable method is available in. For the record, in an attempt
     * to provide a stand-alone action to return this collection of Record Types
     * only in Screen Flows, I tried using an Aura Local Action, but couldn't get it
     * to work. If you've found a way to do this, I'd love to incorporate that!
     * 
     */
    @InvocableMethod(
        label='Record Types for Running User'
        description='Input an Object\'s API name, returns a collection of Record Types that are available to the running user'
    )
    /**
     */
    public static List<RecordTypePickerController.Result> invokeGetRecordTypes(List<RecordTypePickerController.Request> requests) {
        Set<String> objectNameSet = new Set<String>();
        Set<Id> availableRecordTypeIds = New Set<Id>();
        List<RecordTypePickerController.Result> results = New List<RecordTypePickerController.Result>();

        For (RecordTypePickerController.Request request : requests) {
            objectNameSet.add(request.objectApiName);
        }


        availableRecordTypeIds.addAll(
            RecordTypePickerController.availableRecordTypeIdsFromObjectApiNames(New List<String>( objectNameSet ))
        );

        Map<String,List<RecordType>> objToRtMap = RecordTypePickerController.getMapOfObjectNameToRT(
            RecordTypePickerController.recordTypesFromIds(availableRecordTypeIds)
        );

        For (RecordTypePickerController.Request request : requests) {
            RecordTypePickerController.Result result = New RecordTypePickerController.Result();
            result.recordTypes = objToRtMap.get(request.objectApiName);
            results.add(result);
        }
        
        return results;
    }

    public class Request {
        @InvocableVariable(
            label='Object API Name'
            required=true
        )
        public String objectApiName;
    }

    public class Result {
        @InvocableVariable(
            label='Record Types for Running User'
        )
        public List<RecordType> recordTypes;
    }

    /**
     * For future use in Custom Property Editor to Return a list of Objects with RecordTypes
     * 
     */
    @AuraEnabled(cacheable=true)
    public static List<EntityDefinition> getObjectsWithRecordTypes(){

        List<RecordType> activeRecordTypes = [
            SELECT SObjectType 
            FROM RecordType 
            WHERE IsActive = true
        ];

        Set<String> SObjectsWithRecordTypes = new Set<String>();

        For (RecordType recordType : activeRecordTypes){
            SObjectsWithRecordTypes.add(recordType.SObjectType);
        }

        return [
            SELECT MasterLabel, QualifiedApiName 
            FROM EntityDefinition
            WHERE QualifiedApiName IN :SObjectsWithRecordTypes
        ];
    }

    private static List<RecordType> recordTypesFromIds(Set<Id> ids) {
        return  [ SELECT Id, Name, Description, DeveloperName, SobjectType 
                  FROM RecordType   
                  WHERE Id IN :ids];
    }

    /**
     * Here we take a list of RecordTypes from the result of the RecordType query
     * and transform it into a map of object names to each object name's list of Record Types
     * 
     * This map enables us to rebuild the list of results from the list of requests
     * that we're working with in the invocable method
     */
    private static Map<String,List<RecordType>> getMapOfObjectNameToRT(List<RecordType> recordTypes) {
        Map<String,List<RecordType>> resultMap = New Map<String,List<RecordType>>();
        For (RecordType rt : recordTypes) {
            if (resultMap.containsKey(rt.SobjectType)) {
                List<RecordType> rts = resultMap.get(rt.SObjectType);
                rts.add(rt);
                resultMap.put(rt.SobjectType,rts);
            } else {
                resultMap.put(rt.SobjectType, New List<RecordType>{rt});
            }
        }
        return resultMap;
    }

    /**
     * Your final words before creating a bowl of spaghetti code always contain the word "clever"
     * 
     * This is a clever hack to avoid the performance hit of a global describe call
     */
    private static SObjectType getSObjectTypeFromObjName(String objectApiName) {
        SObjectType t = ((SObject)(Type.forName('Schema.'+ objectApiName).newInstance())).getSObjectType();
        return t;
    }

    /**
     *  Takes an SObjectType instance and returns a set of Ids containing 
     *  the active and available record types for that SObject
     */
    private static Set<Id> availableRecordTypeIdsFromObjectApiNames(List<String> objectApiNames){
        Set<Id> resultRecordTypeIds = new Set<Id>();
        
        // this seems like not the best way to handle this, would love to revisit
        for (Schema.DescribeSObjectResult describeInfo : Schema.describeSObjects(objectApiNames)){
            for (Schema.RecordTypeInfo rtInfo : describeInfo.getRecordTypeInfos()){
                if (rtInfo.isActive() && rtInfo.isAvailable()) {
                    resultRecordTypeIds.add(rtInfo.getRecordTypeId());
                }
            }
        }
        return resultRecordTypeIds;
    }
}
