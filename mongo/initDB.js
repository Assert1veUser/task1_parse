db.createCollection("employee", {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: [
                'fullName',
                'position',
                'department'
            ],
            properties: {
                full_name: {
                    bsonType: 'string',
                    description: 'employee full name'
                },
                position: {
                    bsonType: 'string',
                    description: 'the position where the employee works'
                },
                department: {
                    bsonType: 'string',
                    description: 'the department where the employee works'
                }
            }
        }
    }
})