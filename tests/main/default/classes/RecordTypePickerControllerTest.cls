@IsTest
private class RecordTypePickerControllerTest {
    final static String OBJECT_NAME = 'Contact'; // Object API Name user should have access to
    final static String RECORDTYPE_DEVNAME = 'External'; // RecordType DeveloperName user should have access to
    final static String USER_ALIAS = 'rtTest';

    @TestSetup
    static void makeData(){
        final String BASE_PROFILE_NAME = 'Minimum Access - Salesforce'; // base profile name to assign test user
        final String PERMISSION_SET_NAME = 'RecordTypePickerPermissionsTesting'; //perm set included in test directory

        Profile baseProfile = [
            SELECT Id
            FROM Profile
            WHERE Name = :BASE_PROFILE_NAME
            LIMIT 1
        ];
        
        PermissionSet permSet = [
            SELECT Id
            FROM PermissionSet
            WHERE Name = :PERMISSION_SET_NAME
            LIMIT 1
        ];

        User testUser = New User(
            Username = String.valueOf(DateTime.now().getTime()) + '@recordtypetesting.com',
            Email = 'test@test.invalid',
            LastName = 'Test',
            EmailEncodingKey='UTF-8',
            LanguageLocaleKey='en_US',
            LocaleSidKey='en_US',
            TimeZoneSidKey='America/New_York',
            ProfileId = baseProfile.Id,
            alias = RecordTypePickerControllerTest.USER_ALIAS
        );
        insert testUser;
        PermissionSetAssignment userPermSetAssign = New PermissionSetAssignment(
            PermissionSetId = permSet.Id,
            AssigneeId = testUser.Id
        );
        insert userPermSetAssign;
    }

    @IsTest
    static void getRecordTypes_shouldReturnUserAvailableRecordTypes(){

        User testUser = [
            SELECT Id
            FROM User
            WHERE Alias = :RecordTypePickerControllerTest.USER_ALIAS
            LIMIT 1
        ];

        List<RecordType> recordTypes = new List<RecordType>();

        System.runAs(testUser){
            Test.startTest();
            recordTypes = RecordTypePickerController.getRecordTypes(RecordTypePickerControllerTest.OBJECT_NAME);
            Test.stopTest();
        }

        System.assertEquals(
            1,
            recordTypes.size(),
            'number of available record types doesn\'t match results'
        );

        System.assertEquals(
            RecordTypePickerControllerTest.RECORDTYPE_DEVNAME,
            recordTypes[0].DeveloperName,
            'Retrieved RecordType DeveloperName does not match expected RecordType'
        );
    }

    @IsTest 
    static void invokeGetRecordTypes_invokeShouldHaveSameResultsAsGetRecordTypes() {

        RecordTypePickerController.Request request = New RecordTypePickerController.Request();
        request.objectApiName = RecordTypePickerControllerTest.OBJECT_NAME;

        List<RecordTypePickerController.Result> results = 
            RecordTypePickerController.invokeGetRecordTypes(
                New List<RecordTypePickerController.Request>{ request }
            );

        List<RecordType> recordTypesFromAuraEnabled = 
            RecordTypePickerController.getRecordTypes(RecordTypePickerControllerTest.OBJECT_NAME);
        
        System.assertEquals(
            recordTypesFromAuraEnabled.size(),
            results[0].recordTypes.size(),
            'Results from Invocable do not match results from getRecordTypes'
        );
    }

    @IsTest 
    static void getObjectsWithRecordTypes_shouldReturnContact(){
        List<EntityDefinition> entities = new List<EntityDefinition>();

        Test.startTest();
        entities = RecordTypePickerController.getObjectsWithRecordTypes();
        Test.stopTest();

        System.assertEquals(
            entities.size(),
            1,
            'getObjectsWithRecordTypes returned an unexpected number of objects'
        );

        System.assertEquals(
            entities[0].QualifiedApiName,
            RecordTypePickerControllerTest.OBJECT_NAME,
            'getObjectsWithRecordTypes did not return the expected object'
        );
    }

}
