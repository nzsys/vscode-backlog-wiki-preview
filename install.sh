#!/bin/bash

set -e

echo "Building Backlog Wiki Preview extension..."
if [ ! -d "node_modules" ]; then
    npm install
fi

npm run compile

echo "Packaging extension..."
yes | npx @vscode/vsce package --out backlog-wiki-preview.vsix --allow-missing-repository

echo "Installing extension to VS Code..."
if command -v code >/dev/null 2>&1; then
    code --install-extension backlog-wiki-preview.vsix --force
else
    VSCODE_BIN="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
    if [ -f "$VSCODE_BIN" ]; then
        "$VSCODE_BIN" --install-extension backlog-wiki-preview.vsix --force
    else
        echo "Error: 'code' command not found and not found in /Applications."
        echo "Please install 'code' command in your PATH from VS Code Command Palette:"
        echo "  1. Open VS Code"
        echo "  2. Press Cmd+Shift+P"
        echo "  3. Search for 'Shell Command: Install 'code' command in PATH'"
        exit 1
    fi
fi

echo "Success! Extension installed. Please restart/reload VS Code window."
