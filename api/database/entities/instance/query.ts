
import { builder } from '../../builder.js'
import { Instance_Ref } from './schema.js'
import {
    db_get_instance_by_uid,
    db_get_all_instances
} from './repository.js'

builder.queryFields(t => ({

    instance: t.field({
        type: Instance_Ref,
        nullable: true,

        args: {
            uid: t.arg.string({
                required: true
            })
        },

        resolve: (_root, args, context) => {

            if (!context.user) {
                throw new Error('Unauthorized')
            }

            return db_get_instance_by_uid(
                context.driver,
                context.user.id,
                args.uid
            )
        }
    }),

    instances: t.field({
        type: [Instance_Ref],

        resolve: (_root, _args, context) => {

            if (!context.user) {
                throw new Error('Unauthorized')
            }

            return db_get_all_instances(
                context.driver,
                context.user.id
            )
        }
    })
}))