
import { builder } from '../../../builder.js'
import type {
    Asset,
    Update_Asset_Metadata_Input
} from '@schematician/shared'


export const Asset_Type_Enum = builder.enumType(
    'Asset_Type',
    {
        values: [
            'Image',
            'Model_3D',
            'Audio',
            'Video'
        ] as const
    }
)


export const Asset_Ref = builder.objectRef<Asset>(
    'Asset'
)

Asset_Ref.implement({
    fields: t => ({
        uid: t.exposeString('uid'),

        type: t.expose('type', {
            type: Asset_Type_Enum
        }),

        object_key: t.exposeString('object_key'),

        mime_type: t.exposeString('mime_type'),

        original_filename: t.exposeString(
            'original_filename',
            {
                nullable: true
            }
        ),

        size_bytes: t.exposeInt(
            'size_bytes',
            {
                nullable: true
            }
        )
    })
})


export const Create_Asset_Metadata_Input_Ref =
    builder.inputRef<Asset>(
        'Create_Asset_Metadata_Input'
    )

Create_Asset_Metadata_Input_Ref.implement({
    fields: t => ({
        uid: t.string({
            required: true
        }),

        type: t.field({
            type: Asset_Type_Enum,
            required: true
        }),

        object_key: t.string({
            required: true
        }),

        mime_type: t.string({
            required: true
        }),

        original_filename: t.string(),

        size_bytes: t.int()
    })
})


export const Update_Asset_Metadata_Input_Ref =
    builder.inputRef<Update_Asset_Metadata_Input>(
        'Update_Asset_Metadata_Input'
    )

Update_Asset_Metadata_Input_Ref.implement({
    fields: t => ({
        uid: t.string({
            required: true
        }),

        original_filename: t.string()
    })
})


export interface Delete_Asset_Metadata_Result {
    success: boolean
    message: string
    deleted_uid?: string | null
}


export const Delete_Asset_Metadata_Result_Ref =
    builder.objectRef<Delete_Asset_Metadata_Result>(
        'Delete_Asset_Metadata_Result'
    )

Delete_Asset_Metadata_Result_Ref.implement({
    fields: t => ({
        success: t.exposeBoolean('success'),

        message: t.exposeString('message'),

        deleted_uid: t.exposeString(
            'deleted_uid',
            {
                nullable: true
            }
        )
    })
})