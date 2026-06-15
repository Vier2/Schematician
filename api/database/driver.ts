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