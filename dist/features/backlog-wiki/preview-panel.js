import * as vscode from 'vscode';
import { BacklogWikiParser } from './parser.js';
export class BacklogPreviewPanel {
    static currentPanel;
    _panel;
    _document;
    _disposables = [];
    _parser;
    constructor(panel, document) {
        this._panel = panel;
        this._document = document;
        this._parser = new BacklogWikiParser();
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === this._document.uri.toString()) {
                this._update();
            }
        }, null, this._disposables);
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'backlog') {
                this._document = editor.document;
                this._panel.title = `Preview ${editor.document.fileName.split('/').pop()}`;
                this._update();
            }
        }, null, this._disposables);
    }
    static createOrShow(extensionUri, document) {
        if (BacklogPreviewPanel.currentPanel) {
            BacklogPreviewPanel.currentPanel._document = document;
            BacklogPreviewPanel.currentPanel._panel.title = `Preview ${document.fileName.split('/').pop()}`;
            BacklogPreviewPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
            BacklogPreviewPanel.currentPanel._update();
            return;
        }
        const panel = vscode.window.createWebviewPanel('backlogPreview', `Preview ${document.fileName.split('/').pop()}`, vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [extensionUri]
        });
        BacklogPreviewPanel.currentPanel = new BacklogPreviewPanel(panel, document);
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
        const html = this._parser.convertToHtml(this._document.getText());
        this._panel.webview.html = this._getHtmlTemplate(html);
    }
    _getHtmlTemplate(html) {
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
                    h1 { border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
                    h2 { border-bottom: 1px solid #eee; margin-top: 1.5em; }
                    pre { background-color: rgba(0,0,0,0.05); padding: 15px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); overflow-x: auto; }
                    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 0.9em; }
                    ul { margin-top: 0.5em; margin-bottom: 0.5em; }
                    a { color: #007acc; text-decoration: none; }
                    del { color: #888; }
                    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
                    th, td { border: 1px solid var(--vscode-panel-border); padding: 8px; text-align: left; }
                    th { background-color: rgba(0,0,0,0.1); }
                    blockquote { border-left: 4px solid #eee; padding-left: 1em; margin-left: 0; color: #666; font-style: italic; }
                    hr { border: none; border-top: 1px solid var(--vscode-panel-border); margin: 2em 0; }
                </style>
            </head>
            <body>
                ${html.value}
            </body>
            </html>`;
    }
}
//# sourceMappingURL=preview-panel.js.map