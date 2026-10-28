# Math system

This directory models mathematical expressions as structured Schematician instances and executes them through typed operation definitions. It contains two related paths:

- **Numeric execution:** an `Operation_Invocation` is resolved, its inputs are converted to primitive JavaScript values, an executor runs, and its result is wrapped back into GraphQL-shaped instances with an execution trace.
- **Symbolic expressions:** operation-application instances represent expressions such as `x^2 + 5x + 6`. Objectives can transform those instances locally or translate them to the math-service protocol for SymPy.

The shared contracts are defined in `@schematician/shared`. Math schemas and expression builders are in [object.ts](./object.ts) and [operation/utils.ts](./operation/utils.ts); execution and built-in atomic executors are in [schema.ts](./schema.ts). The objective folders contain operations such as evaluation, substitution, expansion, factoring, and isolation.

## Adding a built-in atomic operation

A built-in atomic operation has three essential pieces: schemas that define its inputs and output, a registered executor, and an `Operation_Definition` that connects the contract to that executor. Use the existing `Power` operation in [schema.ts](./schema.ts) as the closest example; arithmetic definitions also appear in [operation/utils.ts](./operation/utils.ts).

### 1. Define schemas for the inputs and output

Add a schema for each distinct operand and result. A schema gives the runtime data type and the UI-facing label; its UID is the stable identifier used by instances and other code.

```typescript
export const Base_Schema: Schema<'Number'> = {
    uid: 'math.power.base',
    name: 'Base',
    data_type: 'Number'
}
```

Follow these conventions:

- Use a stable, namespaced UID such as `math.<operation>.<role>`.
- Use a concise human-readable `name` in title case (for example, `Base`, `Exponent`, or `Power`).
- Set `data_type` to the actual value type. Common numeric operation schemas use `Schema<'Number'>`.
- Define separate schemas for semantically different roles, even when they share a data type. For example, `Dividend` and `Divisor` are both numbers but communicate different meanings.

Math code commonly assumes schema UIDs are present, so provide them rather than relying on the type's optional UID.

### 2. Register the atomic executor

Add a function to the `Atomic_Executors` map in [schema.ts](./schema.ts). The map key is the executor UID; the function receives a record keyed by input UID and returns a record keyed by output UID. At this point values are primitive JavaScript values, not GraphQL instances.

```typescript
'builtin.number.power': inputs => {
    const base = inputs.base as number
    const exponent = inputs.exponent as number

    return {
        power: base ** exponent
    }
}
```

Keep the executor key, input keys, and output keys aligned with the operation definition. Throw a clear error for invalid mathematical cases, as division does when its divisor is zero.

### 3. Define the operation contract

Add an `Operation_Definition` that points to the schemas and executor:

```typescript
export const Power_Operation: Operation_Definition = {
    uid: 'math.operation.power',
    name: 'Power',
    inputs: [
        {
            uid: 'base',
            schema: Base_Schema,
            cardinality: 'Single',
            required: true
        },
        {
            uid: 'exponent',
            schema: Exponent_Schema,
            cardinality: 'Single',
            required: true
        }
    ],
    outputs: [
        {
            uid: 'power',
            schema: Power_Result_Schema,
            cardinality: 'Single'
        }
    ],
    implementation: {
        type: 'Atomic',
        executor_uid: 'builtin.number.power'
    }
}
```

Contract details:

- `uid` identifies the operation; use a stable namespace such as `math.operation.<operation>`.
- `name` is the operation's display name.
- Each input has a stable `uid`, a schema, a `cardinality` of `Single` or `Multiple`, and a `required` flag. Use `Multiple` for a collection of values, as addition does for its addends.
- Each output has a stable `uid`, schema, and cardinality. The output UID must match a key returned by the executor.
- `implementation.type: 'Atomic'` selects the primitive executor path; `executor_uid` must match a key in `Atomic_Executors`.

For a multi-input executor, the resolved value is an array. For example, addition consumes `inputs.addends` and returns `{ sum: ... }`. Keep the executor's return keys identical to the output UIDs.

### 4. Follow the UI naming contract

The operation model currently provides `Operation_Definition.name` and each input/output's `schema.name` as the human-facing labels. A math-specific operation-authoring UI was not found in the inspected GUI sources, so treat this as the display convention for a future or calling UI:

- Show `operation.name` as the operation's title or picker label (for example, **Power**).
- Show `input.schema.name` for operand labels (for example, **Base** and **Exponent**), and `output.schema.name` for the result label.
- Use `uid` values for wiring, serialization, lookups, and traces—not as user-facing labels. Do not derive labels from `executor_uid`.
- Keep labels concise and domain-specific. Use singular nouns for a single operand/result and clear plural or collection language when an input is `Multiple`.

### 5. Add usage and tests

For numeric evaluation, pass the operation definition in an `Operation_Invocation` and bind arguments using each input's UID. Values can come from instances, collections, computation inputs, or prior operation outputs. The evaluator resolves those sources, runs the operation, and returns an `Evaluate_Result` with a trace; see [objectives/evaluate/utils.ts](./objectives/evaluate/utils.ts) and the mean example in [operation/utils.ts](./operation/utils.ts).

Add a focused test for the operation that checks the expected output value and, where relevant, invalid inputs or error cases. Also check that the declared output schema and output UID match the executor result. The API package's test runner is Vitest (`npm test` from `api/`).

## Operation contracts and supporting types

The contracts below come from `@schematician/shared`, primarily [shared_data/src/schema/types.ts](../../../shared_data/src/schema/types.ts). They describe operation definitions, calls, input bindings, execution, and traces.

### Definitions and implementations

| Type/interface | Purpose |
|---|---|
| `Operation_Definition` | The reusable operation catalog entry: stable `uid`, display `name`, input and output definitions, and an implementation. An invocation refers to this definition. |
| `Operation_Input` | One named input contract: `uid`, expected `schema`, `cardinality` (`'Single'` or `'Multiple'`), and whether it is `required`. Argument bindings refer to this UID. |
| `Operation_Output` | One named result contract: `uid`, expected `schema`, and `cardinality` (`'Single'` or `'Multiple'`). Executors must return a value under each output UID. |
| `Operation_Implementation` | Discriminated union selecting either an atomic executor or a composite computation. |
| `Atomic_Operation_Implementation` | `{ type: 'Atomic'; executor_uid: string }`; selects an entry in the math `Atomic_Executors` registry. |
| `Composite_Operation_Implementation` | `{ type: 'Composite'; computation: Computation }`; defines behavior by composing other operations. |
| `Atomic_Executor` | Function type from `Atomic_Values` to `Atomic_Values`. The math runtime passes primitive values to it and wraps returned values using output schemas. |
| `Atomic_Value` / `Atomic_Values` | A value (`unknown`) and a string-keyed record of values used at the executor boundary. Keys correspond to input and output UIDs. |

`Operation_Input.cardinality` uses `'Multiple'`; this differs from the general schema `Cardinality` used by computation inputs, which includes `'Array'`. Follow the field's own declared union.

### Invocation and argument binding

| Type/interface | Purpose |
|---|---|
| `Operation_Invocation` | Type alias for `Operation_Application`; the runtime call shape used by evaluation and computation steps. |
| `Operation_Application` | One call: a unique invocation `uid`, the `operation` definition, and its `arguments`. The definition is reusable; the invocation UID identifies this particular call and its outputs/traces. |
| `Mathematical_Operation_Object` | Alias for `Operation_Application`, retained as an alternate name for the same shape. |
| `Evaluable_Object` | Alias for `Operation_Invocation` in the current shared contract. |
| `Operation_Argument` | Connects an operation input using `input_uid` to a `Value_Source`. There is one binding per supplied input. |
| `Value_Source` | Union describing where an argument value comes from; its variants are listed below. |
| `Instance_Source` | Supplies a `GraphQL_Instance` directly. |
| `Instance_Reference_Source` | Looks up an available instance by `instance_uid` in the execution context. |
| `Computation_Input_Source` | Reads a value from the enclosing computation by `input_uid`. |
| `Operation_Output_Source` | Reads an earlier invocation's value using both `operation_uid` and `output_uid`. |
| `Collection_Source` | Resolves a list of nested value sources into an array of runtime instances. |
| `Branch_Output_Source` | Reads the selected result associated with a `branch_uid`. |

`Literal_Source` is declared in the shared types but is not currently included in the `Value_Source` union. Do not assume operation arguments can use it until that contract is updated and runtime resolution supports it.

### Computations, context, and traces

| Type/interface | Purpose |
|---|---|
| `Computation` | A named composition with `uid`, `inputs`, `outputs`, ordered `operations`, and optional `branches`. Composite operations point to one of these. |
| `Computation_Input` | A computation-level input: UID, schema, and cardinality. Its cardinality is the general schema type, not the operation-input `'Single' | 'Multiple'` union. |
| `Computation_Output` | A named computation result whose `source` selects the value to expose. |
| `Runtime_Value` / `Runtime_Values` | One instance or an array of instances; `Runtime_Values` is a record keyed by input/output UID. |
| `Execution_Context` | Runtime state used to resolve values: computation inputs, available instances, prior operation outputs and traces, and branch outputs. |
| `Atomic_Execution_Context` | An atomic call's invocation UID, operation definition, and resolved inputs. |
| `Operation_Trace` | A call record containing invocation/operation IDs, display name, inputs, outputs, and nested child traces. |
| `Computation_Trace` | A computation-level record containing its IDs/name, inputs, operation traces, and outputs. |
| `Operation_Execution_Result` | A result bundle containing an output record and its operation trace. |
| `Branch` / `Branch_Case` | Optional computation control flow: a condition and cases; each case matches an `equals` value, runs operations, and may select an output source. |

Together, these types separate the **operation contract** (what inputs and outputs mean) from an **invocation** (one use of it), a **value source** (how each argument is obtained), and a **trace** (what happened during execution).

### Symbolic protocol and formatter types

The symbolic protocol is defined separately in [shared_data/src/math/types.ts](../../../shared_data/src/math/types.ts). It is the wire-level expression model used by the adapter, not the runtime operation invocation model.

| Type/interface | Purpose |
|---|---|
| `Math_Protocol_Node` | Union for protocol expressions: numbers, rationals, symbols, operations, and equations. |
| `Math_Operation_Node` | One symbolic operation expression with `operation` and a list of child `arguments`. |
| `Math_Protocol_Operation` | The protocol operation-name union. It currently includes `Add`, `Subtract`, `Multiply`, `Divide`, and `Power`. |
| `OperationMap` | Formatter lookup type mapping operation UIDs to display names. The math-tree formatter has its own lookup; add a new UID there if the symbolic tree should show a friendly label instead of falling back to the UID. |

These protocol types are intentionally not substitutes for `Operation_Definition` and `Operation_Application`: protocol nodes are used for symbolic conversion and service requests, while definitions and applications describe Schematician-side operations.

## When the operation is also symbolic

Numeric execution and symbolic expression conversion are related but separate. An operation can work in `Atomic_Executors` without being understood by the SymPy adapter. If the operation should appear in expressions sent to the math service, update both directions in [adapter/utils.ts](./adapter/utils.ts):

1. Map its operation UID to a math-protocol operation in `map_operation_uid_to_protocol`.
2. Map the protocol operation back to a Schematician operation in `protocol_operation_to_schematician`.
3. Add any required expression-building helper or argument-count validation, following the existing binary-operation helpers.

A symbolic operation should also be represented consistently in the protocol types in `@schematician/shared`. The adapter currently has explicit support for Add, Subtract, Multiply, Divide, and Power; adding only an executor does not add symbolic-service support.

## Runtime behavior and current limits

For an atomic operation, execution follows this sequence:

1. Resolve each argument source into a runtime value.
2. Unwrap atomic instances and arrays into primitive JavaScript values.
3. Call the registered executor.
4. Wrap executor outputs as instances using the declared output schemas.
5. Record inputs, outputs, and operation metadata in the trace.

Automatic output wrapping handles `Number`, `String`, and `Boolean` schemas, plus `Composite` schemas whose fields are single-cardinality and recursively supported. `Array` outputs and composite fields with array cardinality still need dedicated runtime support in `create_instance_from_value` and `wrap_atomic_outputs`.

An operation implemented with `type: 'Composite'` is a different path: it runs a `Computation` rather than an entry in `Atomic_Executors`. Use that when the operation is assembled from other operations instead of implementing one primitive step.

## Directory map

- `object.ts` — core math schemas, including variables and equations.
- `schema.ts` — executor registry, operation execution, and several operation definitions, including Power.
- `operation/` — operation-application schema, instance builders, arithmetic operations, and the mean computation.
- `objectives/` — evaluate, substitute, expand, factor, isolate, and exploratory construct/differentiation areas.
- `adapter/` — conversion between Schematician instances and the symbolic math protocol, plus the SymPy engine integration.
- `formatter/` — readable formatting for instances, results, and traces.
- `computations/` — computation-related code.

## Operation directory and completeness roadmap

This is the catalog of operation definitions currently present in the TypeScript math library. “Atomic” means a built-in executor runs primitive JavaScript math; “Composite” means a computation is assembled from other operations.

| Operation | Implementation | Status / meaning |
|---|---|---|
| Addition | Atomic | Sums one or more addends. |
| Subtraction | Atomic | Subtracts the subtrahend from the minuend. |
| Multiplication | Atomic | Multiplies one or more factors. |
| Division | Atomic | Divides a dividend by a non-zero divisor. |
| Power | Atomic | Raises a base to an exponent. |
| Greater Than | Atomic | Compares two numbers and returns a Boolean. |
| Count | Atomic | Counts a collection of items. |
| Mean | Composite | Sums a collection, counts it, then divides the sum by the count. |
| Radical | Atomic | Returns the real positive-integer-index root; odd roots of negatives are supported, even roots of negatives are rejected. |
| Rational | Atomic | Builds a reduced exact rational from safe-integer numerator/denominator values and returns a `math.rational` composite instance. |
| Modulus | Atomic | Returns the divisor-signed remainder; zero modulus is rejected. |

The new operations have these contracts:

- **Radical:** `radicand` plus a positive safe-integer `index`, returning `root`. It computes the real nth root; odd roots of negative values are allowed, while even roots of negatives throw. Complex roots are outside this operation's domain.
- **Rational:** integer `numerator` and non-zero integer `denominator`, returning a `math.rational` composite with `numerator` and `denominator` children. The result is reduced to lowest terms with a positive denominator (for example, `6 / -8` becomes `-3 / 4`). Inputs must be JavaScript safe integers, so this is exact within that range rather than arbitrary-precision arithmetic.
- **Modulus:** finite numeric `dividend` and non-zero `modulus`, returning `remainder`. The remainder follows the divisor's sign: `-7 mod 3 = 2`, while `7 mod -3 = -2`.

Operation definitions live primarily in [schema.ts](./schema.ts) and [operation/utils.ts](./operation/utils.ts). The symbolic adapter's supported protocol operations are a separate catalog: Add, Subtract, Multiply, Divide, and Power. Rational values have a dedicated protocol node and convert to/from `math.rational` instances. Radical and Modulus are currently numeric built-ins and are not yet protocol operations for SymPy requests.

### Suggested work for a useful core math system

“Complete” depends on the product's intended domain; this is a practical next-step list for a general real-number arithmetic/algebra core, not an exhaustive list of all mathematics:

1. **Basic arithmetic and comparisons:** unary Negation, Absolute Value, equality/inequality, Less Than, Less Than or Equal, Greater Than or Equal, and optionally Minimum/Maximum. Greater Than already exists.
2. **Expression support:** add symbolic protocol and SymPy-service mappings for Radical and Modulus if symbolic factoring/isolation should accept those expressions; keep mappings synchronized across the shared TypeScript protocol, API adapter, and Python service models/converters.
3. **Rational arithmetic:** addition, subtraction, multiplication, and division that preserve exact rational instances. The current Rational operation constructs exact values, but ordinary atomic executors do not yet consume composite rational instances as numeric inputs.
4. **Common numeric functions:** Floor, Ceiling, Factorial, Exponential, Logarithm, and selected trigonometric functions, with explicit domain/precision behavior.
5. **Domain policy:** document whether each operation accepts only real numbers or also exact/complex values. Current built-ins use JavaScript `number`; complex arithmetic is not represented by the current atomic number model.

Some legacy `test.ts` files act as examples or invoke the external math service directly. Automated tests use `*.test.ts` files and mocked engines for service-backed objectives.

## Mathematical verification tests

Run `npm test -- --run` from `api/` to execute the Vitest suite. Tests are grouped beside their implementation: [operation/operations.test.ts](./operation/operations.test.ts), plus separate test files in the `adapter/` and each objective directory. They cover normal results, traces, malformed inputs, domain restrictions, empty collections, and other edge cases.

Known gaps are represented with Vitest's `it.fails`: the suite reports these as **expected failures** while remaining green. This documents the intended mathematical behavior for unfinished cases—currently Construct, Differentiate, finite-input checks for basic arithmetic/comparison, non-real and zero-negative powers, malformed Count collections, empty means, expansion over an empty sum, and a selected branch with no output source. Change these to ordinary passing tests when the corresponding behavior is implemented.
