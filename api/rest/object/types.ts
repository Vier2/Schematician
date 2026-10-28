export interface Create_Signed_Asset_Upload_Options {
    object_key: string
    mime_type: string
    expires_in?: number
}


export interface Asset_Route_Dependencies {
    r2_bucket_name: string
    r2_account_id: string
}