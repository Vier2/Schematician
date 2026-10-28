import {
    Files,
    type SignedUpload
} from 'files-sdk'

import {
    r2
} from 'files-sdk/r2'


import type { Create_Signed_Asset_Upload_Options } from './types.js'

export async function Create_Signed_Asset_Upload_URL(
    bucket_name: string,
    account_id: string,
    options: Create_Signed_Asset_Upload_Options
): Promise<SignedUpload> {
    const files =
        new Files({
            adapter:
                r2({
                    bucket:
                        bucket_name,

                    accountId:
                        account_id
                })
        })

    const upload_url =
        await files.signedUploadUrl(
            options.object_key,
            {
                contentType:
                    options.mime_type,

                expiresIn:
                    options.expires_in ?? 300
            }
        )

    return upload_url
}