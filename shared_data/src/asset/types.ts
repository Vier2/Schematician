

export interface Create_Asset_Upload_Request {
    asset_type: asset_type

    original_filename: string

    mime_type: string

    size_bytes: number
    user_uid: string
}


export interface Create_Asset_Upload_Response {
    asset: Asset

    upload_url: string
}

export type asset_type =
    | 'Image'
    | 'Model_3D'
    | 'Audio'
    | 'Video'
export interface Asset {
    uid: string

    type: asset_type
    object_key: string

    mime_type: string

    original_filename?: string

    size_bytes?: number
}


export interface Update_Asset_Metadata_Input {
    uid: string
    original_filename?: string | null
}