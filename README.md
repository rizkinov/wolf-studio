# CBRE Web Elements

A modern React component library built with Next.js, Tailwind CSS, and shadcn/ui, styled according to CBRE's design system guidelines.

![CBRE Web Elements](https://placeholder-for-cbre-web-elements-banner.png)

## Overview

CBRE Web Elements is a comprehensive UI component library that provides CBRE-styled React components. Built on top of shadcn/ui and Tailwind CSS, it offers:

- **Brand Consistency**: All components follow CBRE's design language with proper colors and sharp corners
- **Modern Framework Support**: Built for React and Next.js applications
- **Developer Experience**: Simple API, fully typed with TypeScript, and extensive documentation
- **Customization**: Easy theming and style overrides through Tailwind CSS

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
- [Theming](#theming)
- [Contributing](#contributing)
- [Development](#development)
- [License](#license)

## Installation

### Using as a dependency in your project

```bash
# npm
npm install cbre-web-elements

# yarn
yarn add cbre-web-elements

# pnpm
pnpm add cbre-web-elements
```

### Required peer dependencies

CBRE Web Elements requires the following peer dependencies:

```bash
npm install react react-dom next tailwindcss
```

### Tailwind CSS Configuration

Add the CBRE theme configuration to your `tailwind.config.js`:

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

## Usage

Import components from the library:

```jsx
import { CBRE } from 'cbre-web-elements';

export default function MyPage() {
  return (
    <div>
      <h1>My CBRE Project</h1>
      <CBRE.CBREButton variant="primary">Click Me</CBRE.CBREButton>
    </div>
  );
}
```

### Namespace Imports

To avoid naming conflicts, components are organized into namespaces:

- `UI`: Base shadcn/ui components
- `CBRE`: CBRE-styled components
- `Blocks`: Higher-level block components

```jsx
import { UI, CBRE, Blocks } from 'cbre-web-elements';

// Example usage
<UI.Button>Base Button</UI.Button>
<CBRE.CBREButton>CBRE Button</CBRE.CBREButton>
<Blocks.CBRECtaBlock>Call to Action</Blocks.CBRECtaBlock>
```

## Components

### Core Components

- **Buttons**: `CBREButton`, `CBREArrowButton`
- **Data Display**: `CBRETable`, `CBREDataTable`, `CBREBadge`
- **Layout**: `CBRECard`, `CBRESidebar`, `CBREResizable`
- **Navigation**: `CBREDropdownMenu`, `CBRETabs`
- **Forms**: `CBRECheckbox`, `CBRESelect`, `CBREDatePicker`
- **Feedback**: `CBREToast`, `CBRETooltip`
- **Others**: `CBREAccordion`, `CBREChart`, `CBREHoverCard`

### Block Components

- `CBRECtaBlock`: Call-to-action component with title and button
- `CBREQuoteBlock`: Quote display with attribution
- `CBRECardGrid`: Grid layout for CBRE cards

### Example Usage

```jsx
// Button example
<CBRE.CBREButton variant="primary">Primary Button</CBRE.CBREButton>
<CBRE.CBREButton variant="outline">Outline Button</CBRE.CBREButton>
<CBRE.CBREButton variant="accent">Accent Button</CBRE.CBREButton>

// Table example
<CBRE.CBRETable>
  <CBRE.CBRETableHeader>
    <CBRE.CBRETableRow>
      <CBRE.CBRETableHead>Name</CBRE.CBRETableHead>
      <CBRE.CBRETableHead>Status</CBRE.CBRETableHead>
    </CBRE.CBRETableRow>
  </CBRE.CBRETableHeader>
  <CBRE.CBRETableBody>
    <CBRE.CBRETableRow>
      <CBRE.CBRETableCell>Example</CBRE.CBRETableCell>
      <CBRE.CBRETableCell>
        <CBRE.CBREBadge variant="success">Active</CBRE.CBREBadge>
      </CBRE.CBRETableCell>
    </CBRE.CBRETableRow>
  </CBRE.CBRETableBody>
</CBRE.CBRETable>
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

The theme is implemented using CSS variables that you can override:

```css
:root {
  --cbre-green: #003F2D;
  --accent-green: #17E88F;
  --dark-green: #012A2D;
  /* Other variables */
}
```

### Customizing Components

You can override the default styles using Tailwind classes:

```jsx
<CBRE.CBREButton className="bg-blue-500 hover:bg-blue-600">
  Custom Color
</CBRE.CBREButton>
```

## Contributing

We welcome contributions to CBRE Web Elements! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/cbre/cbre-web-elements.git
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

4. Generate a new component:
```bash
npm run generateComp
```

### Running Tests

```bash
npm test
```

### Building the Library

```bash
npm run build:lib
```

## License

MIT
