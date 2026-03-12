import * as assert from 'assert'
import * as vscode from 'vscode'

describe('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.')

	it('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('nzsys.vscode-backlog-wiki-preview'))
	});

	it('Should register backlog language', async () => {
		const languages = await vscode.languages.getLanguages()
		assert.ok(languages.includes('backlog'))
	})
})
