import * as assert from 'node:assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { Composer } from '../../commands/Composer';
import * as utils from '../../utils';

suite('Commands: Composer Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let composer: Composer;
	let composerCommand: string;

	setup(() => {
		composer = new Composer();
		composerCommand = 'composer';
	});

	teardown(() => {
		sinon.restore();
	});

	test('Install Sail', async () => {
		const runTaskWithProgressStub = sinon.stub(utils, 'runTaskWithProgress');
		await composer.installSail();
		sinon.assert.calledOnce(runTaskWithProgressStub);
		sinon.assert.calledWith(runTaskWithProgressStub, `${composerCommand} require laravel/sail`, 'Installing Laravel Sail');
	});

	test('Install Sail (dev)', async () => {
		const runTaskWithProgressStub = sinon.stub(utils, 'runTaskWithProgress');
		await composer.installSail(true);
		sinon.assert.calledOnce(runTaskWithProgressStub);
		sinon.assert.calledWith(runTaskWithProgressStub, `${composerCommand} require laravel/sail --dev`, 'Installing Laravel Sail');
	});

	test('Remove Sail', async () => {
		const runTaskWithProgressStub = sinon.stub(utils, 'runTaskWithProgress');
		await composer.removeSail();
		sinon.assert.calledOnce(runTaskWithProgressStub);
		sinon.assert.calledWith(runTaskWithProgressStub, `${composerCommand} remove laravel/sail`, 'Removing Laravel Sail');
	});
});
