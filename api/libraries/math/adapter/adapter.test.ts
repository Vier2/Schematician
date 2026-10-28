import { describe, expect, it } from 'vitest'
import type { Schema } from '@schematician/shared'
import { format_math_instance_tree } from '../formatter/utils.js'
import {
    create_rational_instance,
    math_protocol_to_schematician,
    schematician_to_math_protocol
} from './utils.js'

const custom_numerator_schema: Schema<'Number'> = {
    uid: 'test.fraction.numerator',
    name: 'Top',
    data_type: 'Number'
}

const custom_denominator_schema: Schema<'Number'> = {
    uid: 'test.fraction.denominator',
    name: 'Bottom',
    data_type: 'Number'
}

const custom_rational_schema: Schema<'Composite'> = {
    uid: 'test.fraction',
    name: 'Fraction',
    data_type: 'Composite',
    elements: [
        {
            uid: 'numerator',
            index: 0,
            cardinality: 'Single',
            required: true,
            element: custom_numerator_schema
        },
        {
            uid: 'denominator',
            index: 1,
            cardinality: 'Single',
            required: true,
            element: custom_denominator_schema
        }
    ]
}

describe('rational protocol adapter', () => {
    it('uses injected schemas to create, serialize, deserialize, and format fractions', () => {
        const rational = create_rational_instance(
            'custom.rational',
            2,
            4,
            custom_rational_schema,
            custom_numerator_schema,
            custom_denominator_schema
        )

        expect(rational.schema_uid).toBe(custom_rational_schema.uid)
        expect(schematician_to_math_protocol(
            rational,
            custom_rational_schema
        )).toEqual({
            type: 'Rational',
            numerator: 1,
            denominator: 2
        })
        expect(format_math_instance_tree(rational, custom_rational_schema)).toEqual(['1/2'])

        const round_trip = math_protocol_to_schematician(
            { type: 'Rational', numerator: -6, denominator: -8 },
            new Map(),
            'custom.round_trip',
            custom_rational_schema,
            custom_numerator_schema,
            custom_denominator_schema
        )

        expect(round_trip.schema_uid).toBe(custom_rational_schema.uid)
        expect(schematician_to_math_protocol(
            round_trip,
            custom_rational_schema
        )).toEqual({
            type: 'Rational',
            numerator: 3,
            denominator: 4
        })
    })

    it('rejects zero denominators, unsafe protocol values, and malformed instances', () => {
        expect(() => create_rational_instance(
            'zero.denominator',
            1,
            0,
            custom_rational_schema,
            custom_numerator_schema,
            custom_denominator_schema
        )).toThrow('Rational denominator cannot equal zero.')

        const malformed = {
            uid: 'malformed.rational',
            schema_uid: custom_rational_schema.uid!,
            data_type: 'Composite' as const,
            objects: []
        }
        expect(() => schematician_to_math_protocol(
            malformed,
            custom_rational_schema
        )).toThrow('Rational malformed.rational has invalid components.')

        expect(() => math_protocol_to_schematician(
            { type: 'Rational', numerator: 1.5, denominator: 2 },
            new Map(),
            'unsafe.rational',
            custom_rational_schema,
            custom_numerator_schema,
            custom_denominator_schema
        )).toThrow('Rational numerator and denominator must be safe integers.')
    })
})
