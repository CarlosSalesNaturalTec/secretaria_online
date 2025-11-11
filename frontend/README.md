# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Testes (Jest + React Testing Library)

### Configuração

O projeto está configurado com Jest e React Testing Library para testes de componentes React.

### Dependências de Teste

- **jest**: Framework de testes
- **@testing-library/react**: Utilitários para testar componentes React
- **@testing-library/jest-dom**: Matchers customizados do Jest para DOM
- **ts-jest**: Preset do Jest para TypeScript
- **jest-environment-jsdom**: Ambiente de teste para DOM

### Scripts Disponíveis

```bash
npm test              # Executa testes uma vez
npm run test:watch   # Executa testes em modo watch
npm run test:coverage # Executa testes e gera relatório de cobertura
```

### Estrutura de Testes

Os testes devem ser criados em uma das seguintes estruturas:

```
src/__tests__/       # Diretório de testes
src/components/__tests__/
src/hooks/__tests__/
src/services/__tests__/
```

Ou com sufixo:
- `*.test.ts`
- `*.test.tsx`
- `*.spec.ts`
- `*.spec.tsx`

### Configuração de Teste

**Arquivo de configuração**: `jest.config.js`

**Arquivo de setup**: `src/setupTests.ts`

O arquivo de setup configura:
- Matchers do jest-dom
- Mocks de APIs do navegador (localStorage, sessionStorage, etc.)
- Mocks de IntersectionObserver e ResizeObserver
- Mock do Axios

### Exemplo de Teste

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Matchers Disponíveis

Além dos matchers padrão do Jest, temos acesso aos matchers do jest-dom:

- `toBeInTheDocument()`
- `toBeVisible()`
- `toBeDisabled()`
- `toBeEnabled()`
- `toHaveValue()`
- `toHaveTextContent()`
- `toHaveClass()`
- `toHaveStyle()`
- E muitos outros...

### Cobertura de Testes

A configuração padrão tem threshold 0% para permitir crescimento gradual da cobertura.

Para aumentar o threshold, edite `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

### Troubleshooting

**Problema**: "Cannot find module '@testing-library/react'"

**Solução**: Instale as dependências: `npm install`

**Problema**: "jsdom is not available"

**Solução**: Instale jest-environment-jsdom: `npm install --save-dev jest-environment-jsdom`

Para mais informações sobre React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
