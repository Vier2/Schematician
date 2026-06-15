/**
 * 
 * 1. Register user
 * 2. Delete user
 * 3. change user password
 * 
 */
import { register_user, login_user } from './factory.js'
import { db_delete_user } from './repository.js'
import { builder } from '../../builder.js'

const Auth_Payload_Ref = builder.objectRef<{
    token: string
    user_uid: string
}>('Auth_Payload')

Auth_Payload_Ref.implement({
    fields: t => ({
        token: t.exposeString('token'),
        user_uid: t.exposeString('user_uid')
    })
})

builder.mutationFields(t => ({
    register: t.field({
        type: Auth_Payload_Ref,
        args: {
            username: t.arg.string({ required: true }),
            email: t.arg.string({ required: true }),
            password: t.arg.string({ required: true })
        },
        resolve: async (root, args, context) => {
            const { user, token } = await register_user(context.driver, args.username, args.email, args.password)
            return { token, user_uid: user.uid }
        }
    }),

    login: t.field({
        type: Auth_Payload_Ref,
        args: {
            email: t.arg.string({ required: true }),
            password: t.arg.string({ required: true })
        },
        resolve: async (root, args, context) => {
            const { user, token } = await login_user(context.driver, args.email, args.password)
            return { token, user_uid: user.uid }
        }
    }),

    delete_user: t.field({
        type: 'Boolean',
        args: {
            uid: t.arg.string({ required: true })
        },
        resolve: async (root, args, context) => {
            if (context.user.id !== args.uid) {
                throw new Error('Unauthorized')
            }
            return db_delete_user(context.driver, args.uid)
        }
    })
}))