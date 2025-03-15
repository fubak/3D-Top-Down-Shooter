# ES6 Module Organization Rules

## Code Organization and Modularity

### Use ES6 Modules (Priority: High)
- Use `import` and `export` statements for all module interactions
- Each module should have a single responsibility
- Avoid global variables and namespace pollution
- Export only what is necessary for other modules to use

### File Structure
- One module per file
- Use descriptive filenames that reflect the module's purpose
- Group related modules in appropriate directories

### Best Practices
- Use named exports for better code readability
- Keep module dependencies explicit and minimal
- Document module interfaces and dependencies
- Use consistent import/export patterns across the codebase

### Examples
```javascript
// Good
export class PlayerController { ... }
import { PlayerController } from './controllers/PlayerController';

// Avoid
window.PlayerController = class { ... }
``` 