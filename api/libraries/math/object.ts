import type { Schema } from "@schematician/shared"

export const Binding_Value_Schema: Schema<'Number'> = {
    uid: 'math.binding.value',
    name: 'Binding Value',
    data_type: 'Number'
}


export const Variable_Name_Schema: Schema<'String'> = {
    uid: 'math.variable.name',
    name: 'Variable Name',
    data_type: 'String'
}

export const Variable_Value_Schema: Schema<'Number'> = {
    uid: 'math.variable.value',
    name: 'Variable Value',
    data_type: 'Number'
}
export const Variable_Schema: Schema<'Composite'> = {
    uid: 'math.variable',
    name: 'Variable',
    data_type: 'Composite',

    elements: [
        {
            uid: 'name',
            index: 0,
            cardinality: 'Single',
            required: true,
            element: Variable_Name_Schema
        },

        {
            uid: 'value',
            index: 1,
            cardinality: 'Single',
            required: false,
            element: Variable_Value_Schema
        }
    ]
}

export const Value_Binding_Schema: Schema<'Composite'> = {
    uid: 'math.value_binding',
    name: 'Value Binding',
    data_type: 'Composite',

    elements: [
        {
            uid: 'variable',
            index: 0,
            cardinality: 'Single',
            required: true,
            element: Variable_Schema
        },

        {
            uid: 'value',
            index: 1,
            cardinality: 'Single',
            required: true,
            element: Binding_Value_Schema
        }
    ]
}

export const Expression_Schema: Schema<'Composite'> = {
    uid: 'math.expression',
    name: 'Expression',
    data_type: 'Composite'
}
export const Equation_Schema: Schema<'Composite'> = {
    uid: 'math.equation',
    name: 'Equation',
    data_type: 'Composite',

    elements: [
        {
            uid: 'left',
            cardinality: 'Single',
            index: 0,
            required: true,
            element: Expression_Schema
        },

        {
            uid: 'right',
            cardinality: 'Single',
            index: 1,
            required: true,
            element: Expression_Schema
        }
    ]
}


export const Number_Schema: Schema<'Number'> = {
    uid: 'math.number',
    name: 'Number',
    data_type: 'Number'
}

export const Addend_Schema: Schema<'Number'> = {
    uid: 'math.addend',
    name: 'Addend',
    data_type: 'Number'
}

export const Sum_Schema: Schema<'Number'> = {
    uid: 'math.sum',
    name: 'Sum',
    data_type: 'Number'
}

export const Factor_Schema: Schema<'Number'> = {
    uid: 'math.factor',
    name: 'Factor',
    data_type: 'Number'
}

export const Product_Schema: Schema<'Number'> = {
    uid: 'math.product',
    name: 'Product',
    data_type: 'Number'
}

export const Dividend_Schema: Schema<'Number'> = {
    uid: 'math.dividend',
    name: 'Dividend',
    data_type: 'Number'
}

export const Divisor_Schema: Schema<'Number'> = {
    uid: 'math.divisor',
    name: 'Divisor',
    data_type: 'Number'
}

export const Quotient_Schema: Schema<'Number'> = {
    uid: 'math.quotient',
    name: 'Quotient',
    data_type: 'Number'
}


export const Boolean_Schema: Schema<'Boolean'> = {
    uid: 'math.boolean',
    name: 'Boolean',
    data_type: 'Boolean'
}
