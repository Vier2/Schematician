import { describe, expect, it } from 'vitest'
import type {
    GraphQL_Atomic_Instance,
    GraphQL_Instance,
    Operation_Definition,
    Runtime_Value
} from '@schematician/shared'
import {
    Addition_Operation,
    Count_Operation,
    Division_Operation,
    Mean_Operation,
    Multiplication_Operation,
    Subtraction_Operation
} from './utils.js'
import {
    create_rational_executor,
    execute_operation,
    Greater_Than_Operation,
    Modulus_Operation,
    Power_Operation,
    Radical_Operation,
    Rational_Operation
} from '../schema.js'
import { Number_Schema } from '../object.js'
import { schematician_to_math_protocol } from '../adapter/utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

function run(
    operation: Operation_Definition,
    inputs: Record<string, Runtime_Value>
) {
    return execute_operation(
        `test.${operation.uid}`,
        operation,
        inputs
    )
}

function number_output(
    operation: Operation_Definition,
    inputs: Record<string, Runtime_Value>,
    output_uid: string
): number {
    const result = run(operation, inputs).outputs[output_uid]

    if (
        !result ||
        Array.isArray(result) ||
        result.data_type !== 'Number' ||
        typeof result.value !== 'number'
    ) {
        throw new Error(`Expected numeric output ${output_uid}.`)
    }

    return result.value
}

function boolean_output(
    operation: Operation_Definition,
    inputs: Record<string, Runtime_Value>,
    output_uid: string
): boolean {
    const result = run(operation, inputs).outputs[output_uid]

    if (!result || Array.isArray(result) || result.data_type !== 'Boolean' || typeof result.value !== 'boolean') {
        throw new Error(`Expected Boolean output ${output_uid}.`)
    }

    return result.value
}

function values(...numbers: number[]): GraphQL_Instance[] {
    return numbers.map(
        (value, index) => number_instance(`test.number.${index}`, value)
    )
}

describe('atomic arithmetic operations', () => {
    it('adds multiple values and uses the additive identity for an empty list', () => {
        expect(number_output(
            Addition_Operation,
            { addends: values(2, -3, 5) },
            'sum'
        )).toBe(4)

        expect(number_output(
            Addition_Operation,
            { addends: [] },
            'sum'
        )).toBe(0)
    })

    it('subtracts in operand order and supports negative results', () => {
        expect(number_output(
            Subtraction_Operation,
            { minuend: number_instance('minuend', 3), subtrahend: number_instance('subtrahend', 8) },
            'difference'
        )).toBe(-5)
    })

    it('multiplies multiple values and uses the multiplicative identity for an empty list', () => {
        expect(number_output(
            Multiplication_Operation,
            { factors: values(-2, 3, 4) },
            'product'
        )).toBe(-24)

        expect(number_output(
            Multiplication_Operation,
            { factors: [] },
            'product'
        )).toBe(1)

        expect(number_output(
            Multiplication_Operation,
            { factors: values(0, 7) },
            'product'
        )).toBe(0)
    })

    it('divides and rejects zero divisors', () => {
        expect(number_output(
            Division_Operation,
            { dividend: number_instance('dividend', -9), divisor: number_instance('divisor', 3) },
            'quotient'
        )).toBe(-3)

        expect(() => run(Division_Operation, {
            dividend: number_instance('dividend', 1),
            divisor: number_instance('divisor', 0)
        })).toThrow('Divisor cannot equal zero.')
    })

    it('computes powers, including zero and negative exponents', () => {
        expect(number_output(
            Power_Operation,
            { base: number_instance('base', 2), exponent: number_instance('exponent', -3) },
            'power'
        )).toBe(0.125)

        expect(number_output(
            Power_Operation,
            { base: number_instance('base', 0), exponent: number_instance('exponent', 0) },
            'power'
        )).toBe(1)
    })

    it.fails('rejects non-real powers for a real-number result', () => {
        expect(() => number_output(
            Power_Operation,
            { base: number_instance('base', -2), exponent: number_instance('exponent', 0.5) },
            'power'
        )).toThrow('Power is undefined over the real numbers for these operands.')
    })

    it('compares numbers strictly and treats equal values as not greater', () => {
        expect(boolean_output(
            Greater_Than_Operation,
            { left: number_instance('left', 4), right: number_instance('right', 3) },
            'result'
        )).toBe(true)

        expect(boolean_output(
            Greater_Than_Operation,
            {
                left: number_instance('left', 4),
                right: number_instance('right', 4)
            },
            'result'
        )).toBe(false)
    })

    it('counts empty and populated collections', () => {
        expect(number_output(Count_Operation, { items: [] }, 'count')).toBe(0)
        expect(number_output(Count_Operation, { items: values(2, 4, 6) }, 'count')).toBe(3)
    })

    it.fails('reports a missing required addition input', () => {
        expect(() => run(Addition_Operation, {})).toThrow('Missing required input addends.')
    })

    it.fails('rejects non-finite addends', () => {
        expect(() => number_output(
            Addition_Operation,
            { addends: values(NaN, 1) },
            'sum'
        )).toThrow('Addition operands must be finite numbers.')
    })

    it.fails('rejects non-finite subtraction operands', () => {
        expect(() => number_output(
            Subtraction_Operation,
            { minuend: number_instance('minuend', Infinity), subtrahend: number_instance('subtrahend', 1) },
            'difference'
        )).toThrow('Subtraction operands must be finite numbers.')
    })

    it.fails('rejects non-finite factors', () => {
        expect(() => number_output(
            Multiplication_Operation,
            { factors: values(1, Infinity) },
            'product'
        )).toThrow('Multiplication operands must be finite numbers.')
    })

    it.fails('rejects non-finite division operands', () => {
        expect(() => number_output(
            Division_Operation,
            { dividend: number_instance('dividend', Infinity), divisor: number_instance('divisor', 2) },
            'quotient'
        )).toThrow('Division operands must be finite numbers.')
    })

    it.fails('rejects zero to a negative power', () => {
        expect(() => number_output(
            Power_Operation,
            { base: number_instance('base', 0), exponent: number_instance('exponent', -1) },
            'power'
        )).toThrow('Zero cannot be raised to a negative power.')
    })

    it.fails('rejects unordered comparisons', () => {
        expect(() => boolean_output(
            Greater_Than_Operation,
            { left: number_instance('left', NaN), right: number_instance('right', 1) },
            'result'
        )).toThrow('Comparison operands must be finite numbers.')
    })

    it.fails('rejects malformed collection inputs', () => {
        expect(() => run(Count_Operation, {
            items: number_instance('not-a-collection', 3)
        })).toThrow('Count expects a collection.')
    })
})

describe('composite mean operation', () => {
    it('calculates the arithmetic mean and returns a lone value unchanged', () => {
        expect(number_output(
            Mean_Operation,
            { values: values(3, 5, 7) },
            'mean'
        )).toBe(5)

        expect(number_output(
            Mean_Operation,
            { values: values(11) },
            'mean'
        )).toBe(11)
    })

    it.fails('rejects the undefined mean of an empty collection', () => {
        expect(() => number_output(
            Mean_Operation,
            { values: [] },
            'mean'
        )).toThrow('Mean is undefined for an empty collection.')
    })
})

describe('radical operation', () => {
    it('computes square and odd roots over the reals', () => {
        expect(number_output(
            Radical_Operation,
            { radicand: number_instance('radicand', 81), index: number_instance('index', 2) },
            'root'
        )).toBe(9)

        expect(number_output(
            Radical_Operation,
            { radicand: number_instance('radicand', -8), index: number_instance('index', 3) },
            'root'
        )).toBe(-2)

        expect(number_output(
            Radical_Operation,
            { radicand: number_instance('radicand', 0), index: number_instance('index', 5) },
            'root'
        )).toBe(0)

        expect(number_output(
            Radical_Operation,
            { radicand: number_instance('radicand', -9), index: number_instance('index', 1) },
            'root'
        )).toBe(-9)
    })

    it('rejects invalid indices, non-finite radicands, and even roots of negatives', () => {
        for (const index of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
            expect(() => run(Radical_Operation, {
                radicand: number_instance('radicand', 4),
                index: number_instance('index', index)
            })).toThrow('Root index must be a positive safe integer.')
        }

        expect(() => run(Radical_Operation, {
            radicand: number_instance('radicand', -4),
            index: number_instance('index', 2)
        })).toThrow('Even roots of negative numbers are not real.')

        for (const radicand of [NaN, Infinity, -Infinity]) {
            expect(() => run(Radical_Operation, {
                radicand: number_instance('radicand', radicand),
                index: number_instance('index', 2)
            })).toThrow('Radicand must be a finite number.')
        }
    })
})

describe('rational operation', () => {
    it('accepts an injected rational normalizer', () => {
        const executor = create_rational_executor(
            (numerator, denominator) => ({
                numerator: numerator + 1,
                denominator
            })
        )

        expect(executor({ numerator: 2, denominator: 3 })).toEqual({
            rational: { numerator: 3, denominator: 3 }
        })
    })

    it('reduces fractions, normalizes signs, and represents zero canonically', () => {
        const result = run(Rational_Operation, {
            numerator: number_instance('numerator', 6),
            denominator: number_instance('denominator', -8)
        }).outputs.rational

        expect(result && !Array.isArray(result)
            ? schematician_to_math_protocol(result)
            : undefined
        ).toEqual({ type: 'Rational', numerator: -3, denominator: 4 })

        const zero = run(Rational_Operation, {
            numerator: number_instance('numerator', 0),
            denominator: number_instance('denominator', -25)
        }).outputs.rational

        expect(zero && !Array.isArray(zero)
            ? schematician_to_math_protocol(zero)
            : undefined
        ).toEqual({ type: 'Rational', numerator: 0, denominator: 1 })

        const safe_integer = run(Rational_Operation, {
            numerator: number_instance('max.safe', Number.MAX_SAFE_INTEGER),
            denominator: number_instance('same.max.safe', Number.MAX_SAFE_INTEGER)
        }).outputs.rational
        expect(safe_integer && !Array.isArray(safe_integer)
            ? schematician_to_math_protocol(safe_integer)
            : undefined
        ).toEqual({ type: 'Rational', numerator: 1, denominator: 1 })
    })

    it('rejects zero denominators and unsafe or fractional components', () => {
        expect(() => run(Rational_Operation, {
            numerator: number_instance('numerator', 1),
            denominator: number_instance('denominator', 0)
        })).toThrow('Rational denominator cannot equal zero.')

        for (const numerator of [1.5, Number.MAX_SAFE_INTEGER + 1]) {
            expect(() => run(Rational_Operation, {
                numerator: number_instance('numerator', numerator),
                denominator: number_instance('denominator', 2)
            })).toThrow('Rational numerator and denominator must be safe integers.')
        }
    })
})

describe('modulus operation', () => {
    it('returns a remainder with the divisor sign', () => {
        expect(number_output(
            Modulus_Operation,
            { dividend: number_instance('dividend', -7), modulus: number_instance('modulus', 3) },
            'remainder'
        )).toBe(2)

        expect(number_output(
            Modulus_Operation,
            { dividend: number_instance('dividend', 7), modulus: number_instance('modulus', -3) },
            'remainder'
        )).toBe(-2)

        expect(number_output(
            Modulus_Operation,
            { dividend: number_instance('dividend', 6), modulus: number_instance('modulus', 3) },
            'remainder'
        )).toBe(0)

        expect(number_output(
            Modulus_Operation,
            { dividend: number_instance('dividend', 5.5), modulus: number_instance('modulus', 2) },
            'remainder'
        )).toBe(1.5)
    })

    it('rejects zero modulus and non-finite operands', () => {
        expect(() => run(Modulus_Operation, {
            dividend: number_instance('dividend', 5),
            modulus: number_instance('modulus', 0)
        })).toThrow('Modulus cannot equal zero.')

        for (const dividend of [NaN, Infinity, -Infinity]) {
            expect(() => run(Modulus_Operation, {
                dividend: number_instance('dividend', dividend),
                modulus: number_instance('modulus', 3)
            })).toThrow('Modulus operands must be finite numbers.')
        }
    })
})
