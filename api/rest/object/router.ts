import type {
    FastifyInstance
} from 'fastify'

import {
    randomUUID
} from 'node:crypto'

import type {
     Create_Asset_Upload_Request,
     Create_Asset_Upload_Response,
     Asset
     } from '@schematician/shared'

import { Create_Signed_Asset_Upload_URL } from './service.js'
import type 
{ Asset_Route_Dependencies } from './types.js'

export async function Asset_Routes(
    dependencies: Asset_Route_Dependencies
) {
    return async function (
        fastify: FastifyInstance
    ) {
    fastify.post<{
        Body:
        Create_Asset_Upload_Request
    }>(
        '/assets/upload-url',

        async (
            request,
            reply
        ) => {
            const {
                asset_type,
                original_filename,
                mime_type,
                size_bytes,
                user_uid,
            } =
                request.body


            /*
             * Validate the request before giving
             * the client permission to upload.
             */

            if (
                !original_filename ||
                !mime_type ||
                size_bytes <= 0
            ) {
                return reply
                    .code(400)
                    .send({
                        message:
                            'Invalid asset metadata.'
                    })
            }


            const uid =
                randomUUID()


            /*
             * Preserve the extension, but don't
             * use the user's filename as the
             * actual object identity.
             */

            const extension =
                original_filename
                    .split('.')
                    .pop()
                    ?.toLowerCase()


            const object_key =
                extension
                    ? `assets/${user_uid}/${uid}.${extension}`
                    : `assets/${user_uid}/${uid}`

            const asset: Asset = {
                uid,

                type:
                    asset_type,

                object_key,

                mime_type,

                original_filename,

                size_bytes
            }


            const upload_url =
                await Create_Signed_Asset_Upload_URL(
                    dependencies.r2_bucket_name,
                    dependencies.r2_account_id,
                    {
                        object_key,

                        mime_type,

                        expires_in:
                            300
                    }
                )

            const response:
                Create_Asset_Upload_Response = {
                    'asset': asset,
                    'upload_url': upload_url.url
            }


            return reply
                .code(200)
                .send(response)
        }
    )
   
    } }