/**
 * 
 * 1. Create Schema
 * 2. Delete Schema
 * 3. Update Schema
 * 4. 
 */

import { builder } from '../../builder.js'
import { Schema_Ref } from '../../schema.js'
import { db_create_schema, db_update_schema } from './repository.js'
import { Data_Type } from '../../schema.js'
import { v4 as uuidv4 } from 'uuid'

builder.mutationFields(t => ({
    create_schema: t.field({
        type: Schema_Ref,
        args: {
            name: t.arg.string({ required: true }),
            data_type: t.arg({ type: Data_Type, required: true })
        },
        resolve: (root, args, context) => {
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
            data_type: t.arg({ type: Data_Type })
        },
        resolve: (root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }
            const { uid, ...updates } = args
            return db_update_schema(context.driver, uid, updates as any)
        }
    })
}))