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
import { db_get_all_schemas, db_get_schema_by_uid, db_search} from './repository.js'

const Field_Role_Ref = builder.enumType('Field_Role', {
    values: {
        any: { value: 'any' },
        element: { value: 'element' },
        property: { value: 'property' },
        identifier: { value: 'identifier' }
    } as const
})

const Filter_Operator_Ref = builder.enumType('Filter_Operator', {
    values: {
        equals: { value: 'equals' },
        contains: { value: 'contains' },
        greater_than: { value: 'greater_than' },
        less_than: { value: 'less_than' },
        has_field: { value: 'has_field' },
        has_element: { value: 'has_element' },
        has_property: { value: 'has_property' },
        has_identifier: { value: 'has_identifier' }
    } as const
})
const Search_Filter_Input = builder.inputType('Search_Filter_Input', {
    fields: t => ({
        field_schema_uid: t.string({ required: true }),
        field_role: t.field({
            type: Field_Role_Ref,
            required: false
        }),
        operator: t.field({
            type: Filter_Operator_Ref,
            required: true
        }),
        value: t.field({
            type: 'JSON',
            required: false
        })
    })
})
const Search_Logic_Ref = builder.enumType('Search_Logic', {
    values: {
        and: { value: 'and' },
        or: { value: 'or' }
    } as const
})
const Search_Target_Ref = builder.enumType('Search_Target', {
    values: {
        schemas: {value: 'schemas'},
        instances: {value: 'instances'}
    }
})
const Search_Query_Input = builder.inputType('Search_Query_Input', {
    fields: t => ({

        search_target: t.field({
            type: Search_Target_Ref,
            required: true
        }),
        filters: t.field({
            type: [Search_Filter_Input],
            required: false
        }),
        logic: t.field({
            type: Search_Logic_Ref,
            required: false
        })
    })
})

builder.queryFields(t => ({
    schemas: t.field({
        type: [Schema_Ref],
        nullable: true,
        resolve: (root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }
            return db_get_all_schemas(context.driver, context.user.id)
        }
    }),
    schema: t.field({
        type: Schema_Ref,
        nullable: true,
        args: {
            uid: t.arg.string({ required: true })
        },
        resolve: (_root, args, context) => {
            if (!context.user) throw new Error('Unauthorized')

            return db_get_schema_by_uid(
                context.driver,
                context.user.id,
                args.uid
            )
        }
    }),
    search: t.field({
        type: [Schema_Ref],
        args: {
            query: t.arg({
                type: Search_Query_Input,
                required: true
            })
        },
        resolve: (_root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            return db_search(
                context.driver,
                context.user.id,
                args.query as any
            )
        }
    })
}))