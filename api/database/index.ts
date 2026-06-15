import './builder.js'
import './schema.js'
import './entities/user/query.js'
import './entities/user/mutation.js'
import './entities/schema/query.js'
import './entities/schema/mutation.js'

import { builder } from './builder.js'
export const graphql_schema = builder.toSchema()