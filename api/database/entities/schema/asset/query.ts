import { builder } from '../../../builder.js'
import { Asset_Ref } from './types.js'


import { db_get_asset_metadata,
    db_get_all_asset_metadata

 } from './repository.js'

builder.queryFields(t => ({
    asset_metadata: t.field({
        type: Asset_Ref,
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

            return db_get_asset_metadata(
                context.driver,
                context.user.id,
                args.uid
            )
        }
    }),

    all_asset_metadata: t.field({
        type: [Asset_Ref],

        resolve: (_root, _args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            return db_get_all_asset_metadata(
                context.driver,
                context.user.id
            )
        }
    })
}))