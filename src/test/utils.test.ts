import assert from 'node:assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as utils from '../utils';

suite('runTask function', () => {
    let executeTaskStub: sinon.SinonStub;
    let onDidEndTaskProcessStub: sinon.SinonStub;
    let eventEmitter: vscode.EventEmitter<vscode.TaskProcessEndEvent>;
    setup(() => {
        // Avoid WSL2 check by pretending we're not on Windows
        Object.defineProperty(process, 'platform', {
            value: 'darwin'
        });

        executeTaskStub = sinon.stub(vscode.tasks, 'executeTask').resolves();
        eventEmitter = new vscode.EventEmitter<vscode.TaskProcessEndEvent>();
        onDidEndTaskProcessStub = sinon.stub(vscode.tasks, 'onDidEndTaskProcess').returns({
            dispose: () => { }
        });
    });

    teardown(() => {
        sinon.restore();
    });

    test('should resolve when the task succeeds', async () => {
        const taskName = 'Test Task';
        const command = 'echo "Hello, world!"';

        const task = new vscode.Task(
            { type: 'shell' },
            vscode.TaskScope.Workspace,
            taskName,
            'shell',
            new vscode.ShellExecution(command)
        );

        let endTaskListener: (e: vscode.TaskProcessEndEvent) => void;

        const taskExecution = {
            task: task,
            terminate: () => Promise.resolve()
        };

        executeTaskStub.returns(Promise.resolve(taskExecution));

        // Fire the task completion event after task execution is resolved
        process.nextTick(() => {
            eventEmitter.fire({
                execution: taskExecution,
                exitCode: 0
            });
        });

        await utils.runTask(command, taskName);

        assert.strictEqual(executeTaskStub.callCount, 1);
        const executedTask = executeTaskStub.firstCall.args[0];
        assert.strictEqual(executedTask.name, taskName);
        assert.strictEqual(executedTask.source, 'shell');
    });

    test('should reject when task fails', async () => {
        const taskName = 'Failed Task';
        const command = 'invalid-command';

        const task = new vscode.Task(
            { type: 'shell' },
            vscode.TaskScope.Workspace,
            taskName,
            'shell',
            new vscode.ShellExecution(command)
        );

        const taskExecution = {
            task: task,
            terminate: () => Promise.resolve()
        };

        executeTaskStub.returns(Promise.resolve(taskExecution));

        // Fire the task failure event after task execution is resolved
        process.nextTick(() => {
            eventEmitter.fire({
                execution: taskExecution,
                exitCode: 1
            });
        });

        try {
            await utils.runTask(command, taskName);
            assert.fail('Expected task to fail');
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                throw new Error('Expected error to be instance of Error');
            }
            assert.strictEqual(error.message, 'Task failed with exit code 1');
        }
    });
});
