import * as assert from 'node:assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { Sail } from '../../commands/Sail';
import { EventBus } from '../../eventBus';
import * as utils from '../../utils';

suite('Commands: Sail Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let sail: Sail;
    let sailCommand: string;

	setup(() => {
		sail = new Sail();
        sailCommand = './vendor/bin/sail';
	});

	teardown(() => {
		sinon.restore();
	});

	test('Sail up', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.up();
		sinon.assert.calledOnce(runTaskStub);
        sinon.assert.calledWith(runTaskStub, `${sailCommand} up `, 'Sail up');
	});

	test('Sail start', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.start('mysql');
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} up mysql`, 'Starting mysql');
	});

	test('Sail stop', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.stop('mysql');
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} down mysql`, 'Stopping mysql');
	});

	test('Sail kill', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.kill('mysql');
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} kill mysql`, 'Killing mysql');
	});

	test('Sail pause', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.pause('mysql');
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} pause mysql`, 'Pausing mysql');
	});

	test('Sail unpause', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.unpause('mysql');
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} unpause mysql`, 'Unpausing mysql');
	});

	test('Sail ps', async () => {
		const runCommandStub = sinon.stub(utils, 'runCommand').returns(Promise.resolve('{"Service":"mysql","State":"running","Publishers":[],"Image":"mysql","Status":"Up"}\n'));
		const result = await sail.ps();
		sinon.assert.calledOnce(runCommandStub);
		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0].service, 'mysql');
		assert.strictEqual(result[0].state, 'running');
	});

	test('Sail stats', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.stats('mysql');
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} stats mysql`, 'Showing stats for mysql');
	});

	test('Sail down', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.down();
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} down`, 'Stopping all services');
	});

	test('Sail open', async () => {
		const runCommandStub = sinon.stub(utils, 'runCommand');
		await sail.open();
		sinon.assert.calledOnce(runCommandStub);
		sinon.assert.calledWith(runCommandStub, `${sailCommand} open`);
	});

	test('Sail restart', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.restart();
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} restart`, 'Sail restarting');
	});

	test('Sail shell', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.shell();
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} shell`, 'Opening Sail shell');
	});

	test('Sail bash', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.bash();
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} bash`, 'Opening Sail bash');
	});

	test('Sail tinker', async () => {
		const runTaskStub = sinon.stub(utils, 'runTask');
		await sail.tinker();
		sinon.assert.calledOnce(runTaskStub);
		sinon.assert.calledWith(runTaskStub, `${sailCommand} tinker`, 'Opening Sail tinker');
	});
});
