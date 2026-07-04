export interface GraphQL_Instance_Value {
    field_schema_uid: string
    value: unknown
}
export interface GraphQL_Instance {
    uid: string
    schema_uid: string
    /**key value pairs of schema element ids, and instance values */
    objects: GraphQL_Instance_Value[]
}