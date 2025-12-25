# Pandio Browser

A modern Electron-based browser application built with React, TypeScript, and Vite.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MauricioIPastora/pandio-browser.git
cd pandio-browser/pandio-browser
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm start
```

This will start the Electron application in development mode with hot-reload enabled.

## Building for Production

### Package the Application

To create a packaged version of the app:

```bash
npm run package
```

This creates a packaged version in the `out` directory.

### Create Distributables

To create platform-specific distributables (installers, ZIP files, etc.):

```bash
npm run make
```

This will generate distributables for your current platform:

- **Windows**: Squirrel installer
- **macOS**: ZIP archive
- **Linux**: DEB and RPM packages

## Available Scripts

- `npm start` - Start the app in development mode
- `npm run package` - Package the app without creating distributables
- `npm run make` - Create distributables for the current platform
- `npm run lint` - Run ESLint to check code quality

## Tech Stack

- **Electron** - Cross-platform desktop application framework
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Electron Forge** - Complete tooling ecosystem for Electron development

## Project Structure

```
Pandio-browser/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── main.ts         # Electron main process
│   ├── preload.ts      # Preload script
│   └── renderer.tsx    # React entry point
├── forge.config.ts     # Electron Forge configuration
└── package.json        # Project dependencies and scripts
```

## License

MIT

## Author

Mauricio Ignacio Pastora - mauriciopastora@gmail.com
