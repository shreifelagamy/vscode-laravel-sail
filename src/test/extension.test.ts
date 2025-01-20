import * as assert from 'node:assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	teardown(() => {
		sinon.restore();
	});

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
