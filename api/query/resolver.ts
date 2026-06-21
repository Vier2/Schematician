import { db_get_schema_by_uid } from '../database/entities/schema/repository.js'
import { Schema_Ref } from '../database/schema.js'
import { builder } from '../database/builder.js'

builder.queryType({
    fields: t => ({
        schema: t.field({
            type: Schema_Ref,
            nullable: true,
            args: {
                uid: t.arg.string({ required: true })
            },
            resolve: (_root, args, context) => {
                if (!context.user) {
                    throw new Error('Unauthorized')
                }

                return db_get_schema_by_uid(
                    context.driver,
                    context.user.id,
                    args.uid
                )
            }
        })
    })
})