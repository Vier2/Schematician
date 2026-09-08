## Setup
1. ``npm run build``
2. ``npm run start``


## Math Aritechiture

Schematician
GraphQL_Instance
      │
      ▼
Math Engine Adapter
      │
      ▼
CAS representation
      │
      ▼
factor()
      │
      ▼
CAS result
      │
      ▼
Math Engine Adapter
      │
      ▼
GraphQL_Instance

Schematician object
↓
translate
↓
SymPy expression
↓
SymPy.factor()
↓
SymPy expression
↓
translate
↓
Schematician object