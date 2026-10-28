### Recursive mathematical decomposition — mandatory schema-design rule

Every mathematical object, expression, relation, or operation must be represented according to its mathematically defined constituent structure.

**Decomposition procedure:**

1. Identify the parent mathematical entity and its mathematical type.
2. Identify the entity's immediate constituent roles, using established mathematical terminology.
3. Define the type, cardinality, ordering, and constraints of each constituent role.
4. For every constituent that is itself composite, recursively apply the same decomposition procedure.
5. Terminate decomposition at explicitly declared primitives, externally defined atomic entities, or another justified abstraction boundary.
6. Distinguish the reusable schema of an entity from a particular instance containing concrete values.
7. Preserve the mathematical semantics of each operation. Do not treat constituents as interchangeable when their roles are different.
8. Do not substitute a textual formula or a list of related concepts for an explicit constituent structure.

**Example:**

`Equality(2x + 4, (x / 4) × 10)`

- Equality
  - Left Expression
    - Addition
      - Addend: Multiplication
        - Factor: Number(2)
        - Factor: Variable(x)
      - Addend: Number(4)
  - Right Expression
    - Multiplication
      - Factor: Division
        - Dividend: Variable(x)
        - Divisor: Number(4)
      - Factor: Number(10)

**General invariant:** Every non-primitive entity must have a defined composition of constituent entities, and every constituent must have an explicit mathematical role within its parent. Continue recursively until the selected primitive vocabulary or justified abstraction boundary is reached.

The resulting representation must preserve the mathematical meaning of the original entity, including operand roles, operation precedence, type constraints, and any domain restrictions.