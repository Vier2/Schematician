// test.ts (project root)
const BASE_URL = 'http://localhost:3000/graphql'
async function Create_Schema(
    name: string,
    data_type: string,
    token: string
) {
    const result = await gql(`
        mutation CreateSchema($name: String!, $data_type: Data_Type!) {
            create_schema(name: $name, data_type: $data_type) {
                uid
                name
                data_type
            }
        }
    `, {
        name,
        data_type
    }, token)

    return result.data.create_schema
}

async function Create_Schema_Link(
    parent_schema_uid: string,
    child_schema_uid: string,
    role: 'HAS_ELEMENT' | 'HAS_PROPERTY' | 'HAS_IDENTIFIER',
    token: string,
    index?: number
) {
    const result = await gql(`
        mutation CreateSchemaLink(
            $parent_schema_uid: String!,
            $child_schema_uid: String!,
            $role: Schema_Link_Role!,
            $index: Int
        ) {
            create_schema_link(
                parent_schema_uid: $parent_schema_uid,
                child_schema_uid: $child_schema_uid,
                role: $role,
                index: $index
            ) {
                uid
                name
                data_type
            }
        }
    `, {
        parent_schema_uid,
        child_schema_uid,
        role,
        index
    }, token)

    return result.data.create_schema_link
}
async function gql(query: string, variables: Record<string, unknown> = {}, token?: string) {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query, variables })
    })
    const data = await response.json()
    if (data.errors) {
        console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2))
    }
    return data
}

async function run() {
    const login = await gql(`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
        }
    }
`, {
        email: 'xbam2005@gmail.com',
        password: 'hi'
    })

    const token = login.data.login.token

    // console.log(token)
    // console.log('\n--- Create Base Schemas ---')

    // const Definition =
    //     await Create_Schema('Definition', 'String', token)

    // const Independent_Clause =
    //     await Create_Schema('Independent Clause', 'String', token)

    // const Dependent_Clause =
    //     await Create_Schema('Dependent Clause', 'String', token)

    // const Subordinating_Conjunction =
    //     await Create_Schema('Subordinating Conjunction', 'String', token)

    // const Coordinating_Conjunction =
    //     await Create_Schema('Coordinating Conjunction', 'String', token)

    // const Complex_Sentence =
    //     await Create_Schema('Complex Sentence', 'Interface', token)

    // console.log({
    //     Definition,
    //     Independent_Clause,
    //     Dependent_Clause,
    //     Subordinating_Conjunction,
    //     Coordinating_Conjunction,
    //     Complex_Sentence
    // })

    // console.log('\n--- Create Complex Sentence Elements ---')

    // await Create_Schema_Link(
    //     Complex_Sentence.uid,
    //     Independent_Clause.uid,
    //     'HAS_ELEMENT',
    //     token,
    //     0
    // )

    // await Create_Schema_Link(
    //     Complex_Sentence.uid,
    //     Subordinating_Conjunction.uid,
    //     'HAS_ELEMENT',
    //     token,
    //     1
    // )

    // await Create_Schema_Link(
    //     Complex_Sentence.uid,
    //     Dependent_Clause.uid,
    //     'HAS_ELEMENT',
    //     token,
    //     2
    // )

    // await Create_Schema_Link(
    //     Complex_Sentence.uid,
    //     Coordinating_Conjunction.uid,
    //     'HAS_ELEMENT',
    //     token,
    //     3
    // )

    // console.log('\n--- Create Identifier Links ---')

    // await Create_Schema_Link(
    //     Complex_Sentence.uid,
    //     Definition.uid,
    //     'HAS_IDENTIFIER',
    //     token
    // )

    // await Create_Schema_Link(
    //     Dependent_Clause.uid,
    //     Definition.uid,
    //     'HAS_IDENTIFIER',
    //     token
    // )

    // await Create_Schema_Link(
    //     Subordinating_Conjunction.uid,
    //     Definition.uid,
    //     'HAS_IDENTIFIER',
    //     token
    // )

    // await Create_Schema_Link(
    //     Coordinating_Conjunction.uid,
    //     Definition.uid,
    //     'HAS_IDENTIFIER',
    //     token
    // )

    console.log('\n--- Query Complex Sentence Relationships ---')

    const complex_sentence_query = await gql(`
        query GetSchema($uid: String!) {
        schema(uid: $uid) {
            uid
            name
            data_type
            elements {
            uid
            name
            data_type
            }
            identifiers {
            schema {
                uid
                name
                data_type
            }
            value
            }
        }
        }
`, {
        uid: "1911529b-da2a-4c68-9887-72d4425a0bb5"
    }, token)

    console.log(JSON.stringify(complex_sentence_query.data, null, 2))

    console.log('\n--- Get All Schemas ---')

    const schemas = await gql(`
        query {
            schemas {
                uid
                name
                data_type
            }
        }
    `, {}, token)

    console.log(JSON.stringify(schemas.data, null, 2))
}
run()