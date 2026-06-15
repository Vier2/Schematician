import 'dotenv/config'   // ESM style — must be first import
import neo4j from 'neo4j-driver'
const { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD } = process.env

if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
    throw new Error('Missing required Neo4j environment variables')
}

export const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
)

/**
 * Where to define ENV
 */

export async function verify_connection() {
    const session = driver.session()
    try {
        const result = await session.run('RETURN 1 AS n')
        const record = result.records[0]
        if (record) {
            console.log('Neo4j connected:', record.get('n'))
        } else {
            console.error('No records returned')
        }
    } catch (error) {
        console.error('Neo4j connection failed:', error)
    } finally {
        await session.close()
    }
}

verify_connection()