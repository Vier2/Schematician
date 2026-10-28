import { Driver
 } from "neo4j-driver"
import type { Asset, Update_Asset_Metadata_Input } from "@schematician/shared"

import { 
    Execute_Write, 
    Execute_Read,
    Execute_Match_Owned_Entities,
    Execute_Create_Owned_Entity,
    Execute_Delete_Entity,
    Execute_Update_Entity
 } from "../../../utils.js"
export async function db_create_asset_metadata(
    driver: Driver,
    user_uid: string,
    asset: Asset
): Promise<Asset> {
    return Execute_Write(
        driver,
        transaction =>
            Execute_Create_Owned_Entity(
                transaction,
                {
                    operation: 'Create_Owned_Entity',
                    user_uid,
                    entity: 'Asset',
                    properties: {
                        uid: asset.uid,
                        type: asset.type,
                        object_key: asset.object_key,
                        mime_type: asset.mime_type,
                        ...(asset.original_filename !== undefined
                            ? {
                                original_filename:
                                    asset.original_filename
                            }
                            : {}),
                        ...(asset.size_bytes !== undefined
                            ? { size_bytes: asset.size_bytes }
                            : {})
                    }
                }
            )
    )
}

export async function db_get_all_asset_metadata(
    driver: Driver,
    user_uid: string
): Promise<Asset[]> {
    return Execute_Read(
        driver,
        transaction =>
            Execute_Match_Owned_Entities(
                transaction,
                {
                    operation: 'Match_Owned_Entities',
                    user_uid,
                    entity: 'Asset',
                    return: 'Many'
                }
            )
    )
}
export async function db_get_asset_metadata(
    driver: Driver,
    user_uid: string,
    asset_uid: string
): Promise<Asset | null> {
    return Execute_Read(
        driver,
        transaction =>
            Execute_Match_Owned_Entities(
                transaction,
                {
                    operation: 'Match_Owned_Entities',
                    user_uid,
                    entity: 'Asset',
                    where: {
                        uid: asset_uid
                    },
                    return: 'One'
                }
            )
    )
}


export async function db_update_asset_metadata(
    driver: Driver,
    user_uid: string,
    input: Update_Asset_Metadata_Input
): Promise<Asset | null> {
    return Execute_Write<Asset | null>(
        driver,
        async transaction => {
            if (input.original_filename === undefined) {
                return Execute_Match_Owned_Entities<
                    'Asset',
                    'One'
                >(
                    transaction,
                    {
                        operation: 'Match_Owned_Entities',
                        user_uid,
                        entity: 'Asset',
                        where: {
                            uid: input.uid
                        },
                        return: 'One'
                    }
                )
            }

            return Execute_Update_Entity<'Asset'>(
                transaction,
                {
                    operation: 'Update_Entity',

                    entity: 'Asset',

                    where: {
                        uid: input.uid
                    },

                    owned_by: {
                        user_uid
                    },

                    properties: {
                        original_filename:
                            input.original_filename!
                    }
                }
            )
        }
    )
}



export async function db_delete_asset_metadata(
    driver: Driver,
    user_uid: string,
    asset_uid: string
): Promise<boolean> {
    return Execute_Write(
        driver,
        async transaction => {
            const deleted_count =
                await Execute_Delete_Entity<'Asset'>(
                    transaction,
                    {
                        operation: 'Delete_Entity',

                        entity: 'Asset',

                        where: {
                            uid: asset_uid
                        },

                        owned_by: {
                            user_uid
                        },

                        detach: true
                    }
                )

            return deleted_count > 0
        }
    )
}