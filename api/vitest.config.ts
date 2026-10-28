import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [{
        name: 'resolve-api-js-specifiers-to-typescript',
        enforce: 'pre',
        resolveId(source, importer) {
            if (!importer || !source.startsWith('.') || !source.endsWith('.js')) {
                return null
            }

            const source_path = importer.split('?')[0] ?? importer
            const typescript_path = resolve(
                dirname(source_path),
                `${source.slice(0, -3)}.ts`
            )

            return existsSync(typescript_path)
                ? typescript_path
                : null
        }
    }],
    test: {
        include: ['**/*.test.ts']
    }
})
