/**
 * 
 * 
 * 1. Get schema by uuid
 * 2. list schemas by name
 * 3. list schemas created in time range(start, end)
 * 4. list schemas created before a certain time(time_date)
 * 5. list schemas created after a certain time(time_date)
 * 6. list_schemas_by_predefined_field_value(predefined_field, value)
 * 7. list_schemas_by_user_defined_field_value(user_defined_field, value)
 * 7. list all schemas that have _schema_ as predefined_field
 *     - example: To list all notes: list all schemas will have tag==note
 * 
 */

import { builder } from '../../builder.js'
import { Schema_Ref } from '../../schema.js'
import { db_get_all_schemas } from './repository.js'
builder.queryFields(t => ({
    schemas: t.field({
        type: [Schema_Ref],
        nullable: true,
        resolve: (root, args, context) =>
            db_get_all_schemas(context.driver, context.user.id)
    })
}))