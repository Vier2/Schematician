

/**
 * description: high level methods to get data which calls repository
 * - methods to interact with the database
 * 1. get current user (context)
 * 2. Get user by id
 * 2. Get user by email
 * 3. Get all user schemas (sort?=['last_created', 'last_modified', 
 *                                  'first created'])
 * 4. 
 */

import { builder } from '../../builder.js'
import { db_get_user_by_uuid, db_get_user_by_email } from './repository.js'
import type { User_Node } from './repository.js'
const User_Ref = builder.objectRef<User_Node>('User')

User_Ref.implement({
    fields: t => ({
        uid: t.exposeString('uid'),
        username: t.exposeString('username'),
        email: t.exposeString('email')
        // password intentionally omitted
    })
})

builder.queryFields(t => ({
    user_by_uid: t.field({
        type: User_Ref,
        nullable: true,
        args: {
            uid: t.arg.string({ required: true })
        },
        resolve: (root, args, context) =>
            db_get_user_by_uuid(context.driver, args.uid)
    }),

    user_by_email: t.field({
        type: User_Ref,
        nullable: true,
        args: {
            email: t.arg.string({ required: true })
        },
        resolve: (root, args, context) =>
            db_get_user_by_email(context.driver, args.email)
    })
}))