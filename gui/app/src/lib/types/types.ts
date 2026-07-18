import type { GraphQL_Schema } from "@schematician/shared";
export type Cleanup = () => void;
export type Key_Value_Container_Creation = () => HTMLElement



export type CSS_Property = {
    [K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] extends string ? K : never
}[keyof CSSStyleDeclaration] /*This maps over every key, keeps only the ones whose value type is string (which is what actual style properties are), and discards methods and non-string members. The result is a union of only legitimate property names like 'marginTop' | 'display' | 'fontSize' and so on. */

export type CSS_Unit = 'px' | 'rem' | 'em' | 'vh' | 'vw' | '%' | 'fr' | 'deg' | 'ms' | 's' | ''

export type Element_Handler<Type extends any[]> = (Element: HTMLElement, ...args: Type) => void
export type Value_Computer = () => number

/* The index set — just the domain, the set of valid keys
*/
type Index = string | number
export type Index_Set = Set<Index>


export interface GraphQL_Response<T> {
    data: T
    errors?: {
        message: string
    }[]
}

export interface Schemas_Query_Response {
    schemas: GraphQL_Schema[]
}