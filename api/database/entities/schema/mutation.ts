import {
    db_create_schema,
    db_update_schema,
    db_create_schema_link,
    type Schema_Link_Role
} from './repository.js'

import { v4 as uuidv4 } from 'uuid'
import { builder, Data_Type, Data_Type_Ref } from '../../builder.js'
import { Schema_Ref } from '../../schema.js'

const Schema_Link_Role_Ref =
    builder.enumType('Schema_Link_Role', {
        values: {
            HAS_ELEMENT: { value: 'HAS_ELEMENT' },
            HAS_PROPERTY: { value: 'HAS_PROPERTY' },
            HAS_IDENTIFIER: { value: 'HAS_IDENTIFIER' }
        } as const
    })

builder.mutationFields(t => ({
    create_schema: t.field({
        type: Schema_Ref,
        args: {
            name: t.arg.string({ required: true }),
            data_type: t.arg({ type: Data_Type_Ref, required: true })
        },
        resolve: (_root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            return db_create_schema(context.driver, context.user.id, {
                ...args,
                uid: uuidv4()
            } as any)
        }
    }),

    update_schema: t.field({
        type: Schema_Ref,
        nullable: true,
        args: {
            uid: t.arg.string({ required: true }),
            name: t.arg.string(),
            data_type: t.arg({ type: Data_Type_Ref })
        },
        resolve: (_root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            const { uid, ...updates } = args

            return db_update_schema(
                context.driver,
                uid,
                updates as any
            )
        }
    }),

    create_schema_link: t.field({
        type: Schema_Ref,
        nullable: true,
        args: {
            parent_schema_uid: t.arg.string({ required: true }),
            child_schema_uid: t.arg.string({ required: true }),
            role: t.arg({
                type: Schema_Link_Role_Ref,
                required: true
            }),
            index: t.arg.int(),
            value: t.arg({ type: 'JSON' })
        },
        resolve: (_root, args, context) => {
            if (!context.user) throw new Error('Unauthorized')

            return db_create_schema_link(
                context.driver,
                context.user.id,
                args.parent_schema_uid,
                args.child_schema_uid,
                args.role as Schema_Link_Role,
                args.index ?? undefined,
                args.value ?? undefined
            )
        }
    })
}))