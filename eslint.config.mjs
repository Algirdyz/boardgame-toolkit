import mantine from 'eslint-config-mantine';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...mantine,
  prettier,
  { ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}'] },
  {
    rules: {
      'no-console': 'off',
      curly: 'off',
      // Disable rules that conflict with Prettier
      '@typescript-eslint/indent': 'off',
      'max-len': 'off',
    },
  }
);
