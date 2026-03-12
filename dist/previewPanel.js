import * as vscode from 'vscode';
import { BacklogParser } from './parser.js';
export class BacklogPreviewPanel {
    static currentPanel;
    _panel;
    _extensionUri;
    _disposables = [];
    _parser;
    constructor(panel, extensionUri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._parser = new BacklogParser();
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Update when the text document changes
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === vscode.window.activeTextEditor?.document) {
                this._update();
            }
        }, null, this._disposables);
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && (editor.document.languageId === 'backlog')) {
                this._update();
            }
        }, null, this._disposables);
    }
    static createOrShow(extensionUri) {
        if (BacklogPreviewPanel.currentPanel) {
            BacklogPreviewPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
            return;
        }
        const panel = vscode.window.createWebviewPanel('backlogPreview', 'Backlog Wiki Preview', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [extensionUri]
        });
        BacklogPreviewPanel.currentPanel = new BacklogPreviewPanel(panel, extensionUri);
    }
    dispose() {
        BacklogPreviewPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'backlog') {
            this._panel.title = `Preview ${editor.document.fileName.split('/').pop()}`;
            this._panel.webview.html = this._getHtmlForWebview(this._parser.parse(editor.document.getText()));
        }
        else {
            this._panel.webview.html = this._getHtmlForWebview('<p style="color: #888;">No active Backlog Wiki file (.backlog, .bl) found. Please open a file to see the preview.</p>');
        }
    }
    _getHtmlForWebview(contentHtml) {
        return `<!DOCTYPE html>
            <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Backlog Wiki Preview</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        padding: 20px;
                        line-height: 1.6;
                        color: var(--vscode-editor-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    h1 { font-size: 1.8em; border-bottom: 2px solid #eee; margin-bottom: 0.5em; padding-bottom: 0.2em; }
                    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; margin-top: 1.5em; }
                    h3 { font-size: 1.2em; }
                    pre { background-color: rgba(0,0,0,0.05); padding: 15px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); overflow-x: auto; }
                    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 0.9em; }
                    ul { margin-top: 0.5em; margin-bottom: 0.5em; }
                    li { margin-bottom: 0.2em; }
                    a { color: #007acc; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    del { color: #888; }
                </style>
            </head>
            <body>
                ${contentHtml}
            </body>
            </html>`;
    }
}
//# sourceMappingURL=previewPanel.js.map