import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default [...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
), {
    plugins: {
        '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        'comma-spacing': ['error', {
            before: false,
            after: true,
        }],

        'object-curly-spacing': ['error', 'always'],
        'block-spacing': 'error',

        indent: ['error', 4, {
            SwitchCase: 1,
            MemberExpression: 1,
        }],

        'quote-props': ['error', 'as-needed', {
            keywords: false,
        }],

        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'react/prop-types': 0,
        'react/no-unescaped-entities': 0,
        'space-infix-ops': ['error'],
        'vars-on-top': 'warn',
        'no-unused-expressions': 'warn',
        eqeqeq: 'warn',
        'default-case': 'error',
        'max-classes-per-file': 'error',

        'no-console': ['error', {
            allow: ['warn', 'error'],
        }],

        'object-shorthand': 'error',
        'eol-last': ['error', 'always'],

        'prefer-const': ['error', {
            destructuring: 'all',
            ignoreReadBeforeAssign: false,
        }],

        'keyword-spacing': ['error', {
            before: true,
            after: true,
        }],

        'space-before-blocks': 'error',
        curly: ['error', 'multi-or-nest'],
        'brace-style': 2,
    },
}]
