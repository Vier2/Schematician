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
    `, { name, data_type }, token)

    if (result.errors) {
        console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2))
        return null
    }

    return result.data.create_schema
}

async function Create_Schema_Link(
    parent_schema_uid: string,
    child_schema_uid: string,
    role: 'HAS_ELEMENT' | 'HAS_PROPERTY' | 'HAS_IDENTIFIER',
    token: string,
    index?: number,
    value?: unknown
) {
    const result = await gql(`
        mutation CreateSchemaLink(
            $parent_schema_uid: String!,
            $child_schema_uid: String!,
            $role: Schema_Link_Role!,
            $index: Int,
            $value: JSON
        ) {
            create_schema_link(
                parent_schema_uid: $parent_schema_uid,
                child_schema_uid: $child_schema_uid,
                role: $role,
                index: $index,
                value: $value
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
        index,
        value
    }, token)

    if (result.errors) {
        console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2))
        return null
    }

    return result.data.create_schema_link
}
async function Get_Schema(
    uid: string,
    token: string
) {
    const result = await gql(`
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

                properties {
                    schema {
                        uid
                        name
                        data_type
                    }
                    value
                }

                identifiers {
                    schema {
                        uid
                        name
                        data_type
                    }
                    value
                }

                constraints {
                    minimum_number
                    maximum_number
                    can_be_positive
                    can_be_negative
                    minimum_characters
                    maximum_characters
                    regex
                    lowercase
                    uppercase
                }

                enumerations
                options
            }
        }
    `, { uid }, token)

    if (result.errors) {
        console.error(
            'GraphQL Errors:',
            JSON.stringify(result.errors, null, 2)
        )
        return null
    }

    return result.data.schema
}
async function Get_query(uid: string, token: any) {
    const  query = await gql(`
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
        uid: uid
    }, token)
    return query
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
    

    console.log(token)
    console.log('\n--- Create Base Schemas ---')

    const Definition =
        await Create_Schema('Definition', 'String', token)

    const Independent_Clause =
        await Create_Schema('Independent Clause', 'String', token)

    const Dependent_Clause =
        await Create_Schema('Dependent Clause', 'String', token)

    const Subordinating_Conjunction =
        await Create_Schema('Subordinating Conjunction', 'String', token)

    const Coordinating_Conjunction =
        await Create_Schema('Coordinating Conjunction', 'String', token)

    const Complex_Sentence =
        await Create_Schema('Complex Sentence', 'Interface', token)

    console.log({
        Definition,
        Independent_Clause,
        Dependent_Clause,
        Subordinating_Conjunction,
        Coordinating_Conjunction,
        Complex_Sentence
    })

    console.log('\n--- Create Complex Sentence Elements ---')
    await Create_Schema_Link(
        Complex_Sentence.uid,
        Definition.uid,
        'HAS_IDENTIFIER',
        token,
        undefined,
        'a sentence that combines one independent clause with at least one dependent clause'
    )

    await Create_Schema_Link(
        Dependent_Clause.uid,
        Definition.uid,
        'HAS_IDENTIFIER',
        token,
        undefined,
        'a group of words that contains a subject and a verb but cannot stand alone as a complete sentence'
    )

    await Create_Schema_Link(
        Subordinating_Conjunction.uid,
        Definition.uid,
        'HAS_IDENTIFIER',
        token,
        undefined,
        'a word or phrase that connects a dependent clause to an independent clause'
    )
    
    await Create_Schema_Link(
        Coordinating_Conjunction.uid,
        Definition.uid,
        'HAS_IDENTIFIER',
        token,
        undefined,
        'a word that connects words, phrases, or clauses of equal grammatical rank'
    )

    console.log('\n--- Query Complex Sentence Relationships ---')

    const complex_sentence_query = await Get_query(Complex_Sentence.uid, token)
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