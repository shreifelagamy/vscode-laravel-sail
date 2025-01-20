import * as assert from 'node:assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { Artisan } from '../../commands/Artisan';
import * as utils from '../../utils';

suite('Commands: Artisan Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let artisan: Artisan;
	let artisanCommand: string;
    let sailCommand: string;

	setup(() => {
		artisan = new Artisan();
		artisanCommand = 'artisan';
        sailCommand = './vendor/bin/sail';
	});

	teardown(() => {
		sinon.restore();
	});

	test('Artisan migrate', async () => {
		const runTaskStub = sinon.stub(utils, 'runTaskWithProgress');
		await artisan.migrate();
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} ${artisanCommand} migrate`, 'Running Sail Migrate');
	});

	test('Artisan sail instll', async () => {
		const runTaskStub = sinon.stub(utils, 'runTaskWithProgress');
		await artisan.sailInstall();
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${artisanCommand} sail:install`, 'Publishing Docker Compose and Updating .env', true);
	});
});

