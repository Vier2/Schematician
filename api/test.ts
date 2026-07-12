// test.ts (project root)
const BASE_URL = 'http://localhost:3000/graphql'
import { Interface } from "node:readline"
import { db_create_schema } from "./database/entities/schema/repository.js"
import type { GraphQL_Schema } from "./database/schema.js"
import { Data_Type } from "./database/builder.js"
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
async function Create_Instance(
    schema_uid: string,
    objects: {
        field_schema_uid: string
        value: unknown
    }[],
    token: string
) {
    const result = await gql(`
        mutation CreateInstance(
            $schema_uid: String!,
            $objects: [Instance_Value_Input!]!
        ) {
            create_instance(
                schema_uid: $schema_uid,
                objects: $objects
            ) {
                uid
                schema_uid
                objects {
                    field_schema_uid
                    value
                }
            }
        }
    `, {
        schema_uid,
        objects
    }, token)

    if (result.errors) {
        console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2))
        return null
    }

    return result.data.create_instance
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

import neo4j from 'neo4j-driver'


export const driver = neo4j.driver(
    'neo4j+s://d00d4ca0.databases.neo4j.io',
    neo4j.auth.basic('d00d4ca0', 'ZCv6h--i6O-DEPJYOwoQsxoAuzVvuq8T1SnYIoLBcvU')
)

async function run() {
    try {
        await driver.verifyConnectivity()

        const login = await gql(
            `
            mutation Login(
                $email: String!,
                $password: String!
            ) {
                login(
                    email: $email,
                    password: $password
                ) {
                    token
                    user_uid
                }
            }
            `,
            {
                email: 'xbam2005@gmail.com',
                password: `hi`
            }
        )

        if (login.errors) {
            throw new Error(
                login.errors
                    .map((error: { message: string }) => error.message)
                    .join('\n')
            )
        }

        const user_uid = login.data.login.user_uid

        const Introduction = await db_create_schema(
            driver,
            user_uid,
            {
                uid: crypto.randomUUID(),
                name: 'Introduction',
                data_type: Data_Type.String
            }
        )

        const Body = await db_create_schema(
            driver,
            user_uid,
            {
                uid: crypto.randomUUID(),
                name: 'Body',
                data_type: Data_Type.String
            }
        )

        const Conclusion = await db_create_schema(
            driver,
            user_uid,
            {
                uid: crypto.randomUUID(),
                name: 'Conclusion',
                data_type: Data_Type.String
            }
        )

        const Essay = await db_create_schema(
            driver,
            user_uid,
            {
                uid: crypto.randomUUID(),
                name: 'Essay',
                data_type: Data_Type.Interface,

                elements: [
                    Introduction,
                    Body,
                    Conclusion
                ]
            }
        )

        console.log('Created Essay:', Essay)
    }
    catch (error) {
        console.error('Test failed:', error)
    }
    finally {
        await driver.close()
    }
}

run()