export type Search_Target =
    | 'schemas'
    | 'instances'
    | 'activity'

export type Filter_Operator =
    | 'equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'has_field'
    | 'has_element'
    | 'has_property'
    | 'has_identifier'

export type Field_Role =
    | 'any'
    | 'element'
    | 'property'
    | 'identifier'

export interface Search_Filter {
    field_schema_uid: string
    field_role?: Field_Role
    operator: Filter_Operator
    value?: unknown
}

export interface Search_Query {
    target: Search_Target
    filters?: Search_Filter[]
    logic?: 'and' | 'or'
}