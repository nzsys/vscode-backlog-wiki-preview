import * as vscode from 'vscode';
import { BacklogPreviewPanel } from './features/backlog-wiki/preview-panel.js';
export function activate(context) {
    console.log('Backlog Wiki Preview is now active!');
    const showPreviewCommand = vscode.commands.registerCommand('backlog-wiki-preview.showPreview', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Please open a file first.');
            return;
        }
        if (editor.document.languageId !== 'backlog') {
            vscode.window.showErrorMessage('This command only works for Backlog Wiki format files.');
            return;
        }
        BacklogPreviewPanel.createOrShow(context.extensionUri, editor.document);
    });
    context.subscriptions.push(showPreviewCommand);
}
export function deactivate() { }
//# sourceMappingURL=extension.js.map