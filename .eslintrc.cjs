module.exports = {
  root: true,
  env: {
    // browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    // parser: 'babel-eslint',
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      "jsx": true,
    },
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    // '@nuxtjs',
    // 'plugin:vue/essential',
    // '@typescript-eslint',
    'eslint:recommended',
    "plugin:node/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  overrides: [
    // {
    //   "files": ["**/*.ts", "**/*.tsx"],
    //   "extends": [
    //     // "@typescript-eslint",
    //     "eslint:recommended",
    //     "plugin:node/recommended",
    //     "plugin:@typescript-eslint/recommended",
    //     "plugin:@typescript-eslint/eslint-recommended",
    //   ],
    //   "parser": "@typescript-eslint/parser",
    //   "plugins": ["@typescript-eslint"],
    // }
  ],
  // required to lint *.vue files
  plugins: [
    "@typescript-eslint",
    // 'vue'
  ],
  // add your custom rules here
  rules: {
    'curly': ['error', 'multi-line'],
    'space-before-function-paren': ['error', 'always'],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': [2, { props: false }], // Disallow Reassignment of Function Parameters
    'padded-blocks': [2, { classes: 'never', blocks: 'never' }],
    'no-unused-expressions': 'off', // Require or disallow padding within blocks
    'node/no-unpublished-import': 'off',
    'no-unused-vars': 'off', // Require or disallow padding within blocks
    // 'no-unused-vars': ["error", { "args": "after-used", "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }],
    'linebreak-style': 0, // Enforce consistent linebreak style
    'object-curly-spacing': ['error', 'always'], // Enforce consistent spacing inside braces
    'indent': 0, // Enforce consistent indentation
    'no-plusplus': 'off', // Disallow the unary operators ++ and --
    'arrow-body-style': ["error", "as-needed"], // Require braces in arrow function body
    'node/no-unsupported-features/node-builtins': 'off',
    // 'node/no-unsupported-features/es-syntax': 'off',
    'semi': [process.env.NODE_ENV === 'production' ? 'error' : 'warn', "never"],
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "never",
      "exports": "always-multiline",
      "functions": "always-multiline",
    }],

    'array-element-newline': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'array-bracket-newline': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': ['off', { code: 120 }],
    'no-undef': 'off',
  },
  "settings": {
    "node": {
      "tryExtensions": [".js", ".json", ".node", ".ts", ".d.ts"]
    },
  }
}
