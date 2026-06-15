// test.ts (project root)
const BASE_URL = 'http://localhost:3000/graphql'

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
    // 1. Register
    console.log('\n--- Register ---')
    const register = await gql(`
        mutation Register($username: String!, $email: String!, $password: String!) {
            register(username: $username, email: $email, password: $password) {
                token
                user_uid
            }
        }
    `, {
        username: 'Xavier',
        email: 'xbet2005@gmail.com',
        password: 'hi'
    })
    console.log(register.data)

    const token = register.data?.register?.token
    if (!token) {
        console.error('No token returned, stopping')
        return
    }

    // 2. Get user by email
    console.log('\n--- Get User By Email ---')
    const user = await gql(`
        query GetUser($email: String!) {
            user_by_email(email: $email) {
                uid
                username
                email
            }
        }
    `, { email: 'xbet2005@gmail.com' }, token)
    console.log(user.data)

    // 3. Create schema
    console.log('\n--- Create Schema ---')
    const created = await gql(`
        mutation CreateSchema($name: String!, $data_type: Data_Type!) {
            create_schema(name: $name, data_type: $data_type) {
                name
                data_type
            }
        }
    `, {
        name: 'Test Schema',
        data_type: 'String'
    }, token)
    console.log(created.data)

    // 4. Get all schemas
    console.log('\n--- Get All Schemas ---')
    const schemas = await gql(`
        query {
            schemas {
                name
                data_type
            }
        }
    `, {}, token)
    console.log(schemas.data)
}

run()