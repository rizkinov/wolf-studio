# CBRE Web Elements Template

A modern web application template built with Next.js, Tailwind CSS, and shadcn/ui components, featuring CBRE's color palette and sharp corners design.

## Features

- [Next.js](https://nextjs.org/) - React framework for building web applications
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Customizable components built with Radix UI and Tailwind CSS
- CBRE brand colors - Includes the complete CBRE color palette
- Sharp corners - All UI elements have sharp corners consistent with CBRE's design language

## CBRE Color Palette

### Primary Colors
- CBRE Green: `#003F2D`
- Accent Green: `#17E88F`
- Dark Green: `#012A2D`
- Dark Grey: `#435254`
- Light Grey: `#CAD1D3`

### Secondary Colors
- Midnight: `#032842`
- Sage: `#538184`
- Celadon: `#80BBAD`
- Wheat: `#DBD99A`
- Cement: `#7F8480`

## Components Included

- Button - Various button styles with CBRE colors and sharp corners
- Card - Content containers with sharp corners and CBRE color accents
- Avatar - User profile components with sharp corners

## Getting Started

1. Clone this repository:
```bash
git clone https://your-repository-url.git
cd cbre-web-elements
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding More Components

You can easily add more shadcn components using the CLI:

```bash
npx shadcn add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

## Customization

The shadcn components have been customized to remove rounded corners and use the CBRE color palette. You can further customize them by editing the files in the `components/ui` directory. The design tokens and theme variables are defined in the Tailwind configuration and `globals.css`.

## License

MIT
