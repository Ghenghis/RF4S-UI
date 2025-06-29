
# Required Package.json Scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui"
  }
}
```

These scripts enable:
- `npm test` - Run all tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
