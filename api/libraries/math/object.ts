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

export const Radicand_Schema: Schema<'Number'> = {
    uid: 'math.radical.radicand',
    name: 'Radicand',
    data_type: 'Number'
}

export const Root_Index_Schema: Schema<'Number'> = {
    uid: 'math.radical.index',
    name: 'Root Index',
    data_type: 'Number'
}

export const Root_Schema: Schema<'Number'> = {
    uid: 'math.radical.root',
    name: 'Root',
    data_type: 'Number'
}

export const Rational_Numerator_Schema: Schema<'Number'> = {
    uid: 'math.rational.numerator',
    name: 'Numerator',
    data_type: 'Number'
}

export const Rational_Denominator_Schema: Schema<'Number'> = {
    uid: 'math.rational.denominator',
    name: 'Denominator',
    data_type: 'Number'
}

export const Rational_Schema: Schema<'Composite'> = {
    uid: 'math.rational',
    name: 'Rational',
    data_type: 'Composite',
    elements: [
        {
            uid: 'numerator',
            index: 0,
            cardinality: 'Single',
            required: true,
            element: Rational_Numerator_Schema
        },
        {
            uid: 'denominator',
            index: 1,
            cardinality: 'Single',
            required: true,
            element: Rational_Denominator_Schema
        }
    ]
}

export function normalize_rational(
    numerator: number,
    denominator: number
): { numerator: number; denominator: number } {
    if (
        !Number.isSafeInteger(numerator) ||
        !Number.isSafeInteger(denominator)
    ) {
        throw new Error(
            'Rational numerator and denominator must be safe integers.'
        )
    }

    if (denominator === 0) {
        throw new Error(
            'Rational denominator cannot equal zero.'
        )
    }

    let left = Math.abs(numerator)
    let right = Math.abs(denominator)

    while (right !== 0) {
        const remainder = left % right
        left = right
        right = remainder
    }

    const sign = denominator < 0 ? -1 : 1
    const divisor = left

    return {
        numerator: numerator === 0 ? 0 : numerator * sign / divisor,
        denominator: Math.abs(denominator) / divisor
    }
}

export const Modulus_Value_Schema: Schema<'Number'> = {
    uid: 'math.modulus.value',
    name: 'Value',
    data_type: 'Number'
}

export const Modulus_Divisor_Schema: Schema<'Number'> = {
    uid: 'math.modulus.divisor',
    name: 'Modulus',
    data_type: 'Number'
}

export const Modulus_Result_Schema: Schema<'Number'> = {
    uid: 'math.modulus.result',
    name: 'Remainder',
    data_type: 'Number'
}

export const Boolean_Schema: Schema<'Boolean'> = {
    uid: 'math.boolean',
    name: 'Boolean',
    data_type: 'Boolean'
}
