/**
 * File assets for schemas 
 */

import { 
    Send_Put_Request,
    Send_Post_Request
 } from "$lib/shared/utils"

import type { 
    asset_type, Asset,
    Create_Asset_Upload_Request,
    Create_Asset_Upload_Response,
 } from "@schematician/shared"


export async function Upload_Asset(
    api_url: string,
    file: File,
    data: Create_Asset_Upload_Request,
    token: string,
): Promise<Asset> {

    const upload_url_response = await Send_Post_Request<
                                Create_Asset_Upload_Request,
                                Create_Asset_Upload_Response>('/assets/upload-url', data)
        
    const asset_upload_response = await Send_Put_Request<File>(
        upload_url_response.upload_url,
        file,
        {
            content_type:
                file.type,

            authenticated:
                false
        }
    )



    /**
     * 1. Generate URL
     * 2. Upload asset
     * 3. Save Metadata to schema (Apart of Saving Schema)
     */


    return asset
}