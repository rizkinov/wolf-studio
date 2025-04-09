# CBRE Web Elements - GitHub Publication Plan

This document outlines the step-by-step process for publishing the CBRE Web Elements library to GitHub and making it available as an npm package.

## Phase 1: Repository Setup

### Step 1: Create a GitHub Repository

1. Log in to GitHub
2. Create a new repository named "cbre-web-elements"
3. Set the repository visibility (public or private based on requirements)
4. Add a README.md file (use our refined README)
5. Choose an appropriate license (MIT recommended)
6. Create the repository

**Documentation:** 
- Repository URL: `https://github.com/cbre/cbre-web-elements`
- Access permissions: [List team members who should have access]

### Step 2: Initialize Local Repository

1. Prepare the local repository:
   ```bash
   # If starting with an existing codebase
   cd cbre-web-elements
   git init
   git add .
   git commit -m "Initial commit"
   
   # Connect to GitHub remote
   git remote add origin https://github.com/cbre/cbre-web-elements.git
   git branch -M main
   git push -u origin main
   ```

**Documentation:**
- Main branch: `main`
- Initial commit includes: [List key files/directories included]

### Step 3: Set Up Repository Settings

1. Configure branch protection rules for `main`:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branch to be up to date before merging

2. Configure GitHub Pages (if documentation will be hosted there)

3. Set up issue templates and pull request templates

**Documentation:**
- Protected branches: `main`
- Required reviewers: [List required reviewers]

## Phase 2: Package Configuration

### Step 1: Update Package.json

1. Update the package.json file with the configurations from package.json.example:
   ```bash
   # Copy relevant settings from example to current package.json
   cp package.json package.json.backup
   ```

2. Ensure the following fields are properly configured:
   - name: "cbre-web-elements"
   - version: "0.1.0" (or appropriate semver)
   - description
   - main, module, and types fields
   - files array
   - peerDependencies
   - keywords
   - repository, bugs, and homepage URLs

**Documentation:**
- Package name: `cbre-web-elements`
- Initial version: `0.1.0`
- Public or private: `public`

### Step 2: Configure Build Process

1. Install build dependencies:
   ```bash
   npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript rollup-plugin-peer-deps-external rollup-plugin-postcss rollup-plugin-dts rimraf
   ```

2. Copy the rollup configuration from rollup.config.js.example:
   ```bash
   cp rollup.config.js.example rollup.config.js
   ```

3. Update the TypeScript configuration (tsconfig.json) to support library build:
   ```json
   {
     "compilerOptions": {
       "target": "ES2019",
       "module": "ESNext",
       "moduleResolution": "node",
       "declaration": true,
       "declarationDir": "dist/types",
       "sourceMap": true,
       "outDir": "dist",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "jsx": "react",
       "paths": {
         "@/*": ["./*"]
       }
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist", "**/*.stories.tsx", "**/*.test.tsx"]
   }
   ```

**Documentation:**
- Build command: `npm run build:lib`
- Build output directory: `dist/`
- Source files location: `src/`

## Phase 3: Documentation and Examples

### Step 1: Complete Component Documentation

1. Ensure all components have proper JSDoc comments
2. Update the README.md with comprehensive documentation
3. Create example pages for all components
4. Add CONTRIBUTING.md guidelines

**Documentation:**
- Documentation format: JSDoc + Markdown
- Example location: `app/elements-example/`

### Step 2: Set Up Storybook (Optional)

1. Install Storybook dependencies:
   ```bash
   npx storybook init
   ```

2. Configure Storybook for the project:
   ```bash
   # Update .storybook/main.js with appropriate settings
   ```

3. Create stories for components using the CBREButton.stories.tsx.example as a template

**Documentation:**
- Storybook command: `npm run storybook`
- Stories location: `src/components/cbre/*.stories.tsx`

## Phase 4: Testing and Quality Assurance

### Step 1: Set Up Testing Framework

1. Install testing dependencies:
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
   ```

2. Configure Jest in package.json or jest.config.js:
   ```json
   "jest": {
     "testEnvironment": "jsdom",
     "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
     "moduleNameMapper": {
       "^@/(.*)$": "<rootDir>/$1"
     }
   }
   ```

3. Create a basic test for each component

**Documentation:**
- Test command: `npm test`
- Test files location: `src/components/**/*.test.tsx`

### Step 2: Set Up GitHub Actions for CI/CD

1. Create a `.github/workflows` directory
2. Add a CI workflow file for testing:
   ```yaml
   # .github/workflows/ci.yml
   name: CI
   
   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: 'npm'
         - run: npm ci
         - run: npm test
   
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: 'npm'
         - run: npm ci
         - run: npm run build:lib
   ```

**Documentation:**
- CI triggers: Push to main, Pull requests to main
- CI steps: Install dependencies, Run tests, Build library

## Phase 5: Publishing to NPM

### Step 1: Prepare for Publishing

1. Create an NPM account if needed
2. Log in to NPM:
   ```bash
   npm login
   ```

3. Run a test build to verify the package:
   ```bash
   npm run build:lib
   ```

4. Check the package contents:
   ```bash
   npm pack
   ```

**Documentation:**
- NPM account: [Account name]
- Package ownership: [Organization or individual]

### Step 2: Publish the Package

1. For the initial release:
   ```bash
   npm publish --access public
   ```

2. For subsequent releases, use semantic versioning:
   ```bash
   # Update version in package.json first
   npm version patch # or minor or major
   npm publish
   ```

**Documentation:**
- Package visibility: public
- Version convention: Semantic Versioning (MAJOR.MINOR.PATCH)
- Release schedule: [Define how often you plan to release updates]

### Step 3: Set Up Automated Publishing (Optional)

1. Create a publish workflow with GitHub Actions:
   ```yaml
   # .github/workflows/publish.yml
   name: Publish Package
   
   on:
     release:
       types: [created]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18.x'
             registry-url: 'https://registry.npmjs.org'
         - run: npm ci
         - run: npm test
         - run: npm run build:lib
         - run: npm publish
           env:
             NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
   ```

2. Add an NPM token to GitHub repository secrets

**Documentation:**
- Automated publishing trigger: GitHub Release creation
- Required secrets: NPM_TOKEN

## Phase 6: Maintenance and Updates

### Step 1: Create Release Process

1. Define a release process:
   - Merging to main triggers a version bump
   - Creating a GitHub release publishes to npm
   - Release notes should follow a standard format

2. Document the process in CONTRIBUTING.md

**Documentation:**
- Release frequency: [Define schedule]
- Release process owners: [List responsible team members]

### Step 2: Set Up Issue Management

1. Create issue templates for:
   - Bug reports
   - Feature requests
   - Documentation improvements

2. Set up project boards for tracking progress

**Documentation:**
- Issue categories: Bugs, Features, Documentation
- Issue labels: [Define standard labels]

### Step 3: Community Engagement

1. Create a CODE_OF_CONDUCT.md file
2. Set up discussions on GitHub
3. Create a SUPPORT.md file with support information

**Documentation:**
- Support channels: GitHub Issues, [Other channels]
- Response times: [Define expected response times]

## Completion Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Package.json configured
- [ ] Build process set up
- [ ] Documentation completed
- [ ] Tests written and passing
- [ ] CI/CD workflows configured
- [ ] Package published to npm
- [ ] Release process documented
- [ ] Community guidelines established 