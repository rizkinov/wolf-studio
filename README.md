# CBRE Web Elements

A modern React component library styled according to CBRE's design system. Built on top of shadcn/ui and Tailwind CSS, this library provides a consistent, accessible, and customizable UI toolkit for CBRE web applications.

## Features

- **CBRE Design System**: Components adhering to CBRE's brand guidelines
- **Consistent Interface**: Standardized components with consistent styling and behavior
- **TypeScript Support**: Fully typed components for improved developer experience
- **Modular Architecture**: Import only the components you need
- **Accessibility**: Built with accessibility in mind
- **Framework Agnostic**: Works with any React-based framework (Next.js, Remix, Create React App)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
- [Project Structure](#project-structure)
- [Theming](#theming)
- [Contributing](#contributing)
- [Development](#development)

## Installation

### Using npm

```bash
npm install cbre-web-elements
```

### Using yarn

```bash
yarn add cbre-web-elements
```

### Using pnpm

```bash
pnpm add cbre-web-elements
```

### Installing from GitHub

```bash
npm install github:rizkinov/cbre-web-elements
```

### Required Peer Dependencies

```bash
npm install react react-dom next tailwindcss
```

## Usage

### Basic Import and Usage

```jsx
import { CBRE } from 'cbre-web-elements';

function App() {
  return (
    <div>
      <h1>My CBRE Application</h1>
      <CBRE.CBREButton variant="primary">Click Me</CBRE.CBREButton>
    </div>
  );
}
```

### Tailwind CSS Configuration

Add the CBRE theme to your Tailwind configuration:

```js
// tailwind.config.js
const { cbreTheme } = require('cbre-web-elements/theme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/cbre-web-elements/dist/**/*.js',
  ],
  theme: {
    extend: {
      ...cbreTheme,
    },
  },
  plugins: [],
};
```

### Namespace Organization

The library uses namespaces to organize components and avoid naming conflicts:

```jsx
import { UI, CBRE, Blocks } from 'cbre-web-elements';

// Base shadcn components
<UI.Button>Base Button</UI.Button>

// CBRE-styled components
<CBRE.CBREButton>CBRE Button</CBRE.CBREButton>

// Block components (higher-level compositions)
<Blocks.CBRECtaBlock title="Ready to get started?">
  <CBRE.CBREButton>Get in touch</CBRE.CBREButton>
</Blocks.CBRECtaBlock>
```

## Components

### User Interface Components

CBRE Web Elements provides a comprehensive set of UI components:

#### General

- `CBREButton`: Primary action component with multiple variants
- `CBREBadge`: Status indicators and labels
- `CBREArrowButton`: Animated buttons with arrow indicators
- `CBRECard`: Content containers with CBRE styling
- `CBREStyledCard`: Enhanced cards with specific styling options

#### Navigation

- `CBREDropdownMenu`: Expandable menu for actions
- `CBREResizable`: Resizable layout elements
- `CBRESidebar`: Navigational sidebar with CBRE styling
- `CBRETabs`: Tabbed interface for content organization
- `CBREToggle`: Toggle component for on/off states
- `CBREToggleGroup`: Group of toggles for selection
- `CBRETooltip`: Informational hover tooltips

#### Form Components

- `CBRECheckbox`: Checkbox form element
- `CBREDatePicker`: Date selection component
- `CBRESelect`: Dropdown select component

#### Data Display

- `CBRETable`: Tabular data display
- `CBREDataTable`: Enhanced table with sorting, pagination, etc.
- `CBREAccordion`: Expandable content sections
- `CBREChart`: Data visualization components
- `CBREHoverCard`: Rich hover cards for additional information

#### Feedback

- `CBREToast`: Notifications and alerts
- `CBRESeparator`: Visual dividers

### Block Components

Higher-level composed components:

- `CBRECtaBlock`: Call-to-action block with title and content
- `CBREQuoteBlock`: Quote display block with attribution

## Project Structure

The repository is organized as follows:

```
cbre-web-elements/
├── src/                  # Source code
│   ├── components/       # Component files
│   │   ├── ui/           # Base shadcn components
│   │   ├── cbre/         # CBRE-specific components
│   │   └── blocks/       # Higher-level block components
│   ├── lib/              # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── styles/           # Global styles and theme
├── app/                  # Demo application
│   └── elements-example/ # Component examples
├── config/               # Configuration files
├── scripts/              # Build and utility scripts
└── public/               # Static assets
```

## Theming

### CBRE Color Palette

| Color | Hex |
|-------|-----|
| CBRE Green | `#003F2D` |
| Accent Green | `#17E88F` |
| Dark Green | `#012A2D` |
| Dark Grey | `#435254` |
| Light Grey | `#CAD1D3` |
| Lighter Grey | `#E6E8E9` |

### CSS Variables

CBRE Web Elements uses CSS variables for theming that you can override:

```css
:root {
  --cbre-green: #003F2D;
  --accent-green: #17E88F;
  --dark-green: #012A2D;
  --dark-grey: #435254;
  --light-grey: #CAD1D3;
  --lighter-grey: #E6E8E9;
}
```

### Customizing Components

You can customize components using Tailwind classes:

```jsx
<CBRE.CBREButton 
  className="bg-blue-500 hover:bg-blue-600 text-white"
>
  Custom Button
</CBRE.CBREButton>
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

### Code of Conduct

This project adheres to a [Code of Conduct](CONDUCT.md). By participating, you are expected to uphold this code.

## Development

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/rizkinov/cbre-web-elements.git
   cd cbre-web-elements
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building the Library

```bash
npm run build:lib
```

### Creating a New Component

```bash
npm run generateComp
```

### Running Tests

```bash
npm test
```

## License

MIT © [CBRE](LICENSE)
