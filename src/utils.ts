import * as vscode from 'vscode';

export async function runTaskWithProgress(command: string, taskName: string): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: taskName,
        cancellable: false
    }, async (progress) => {
        try {
            await runTask(command, taskName);
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
    });
}

export async function runTask(command: string, taskName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const task = new vscode.Task(
            { type: 'shell' },
            vscode.TaskScope.Workspace,
            taskName,
            'shell',
            new vscode.ShellExecution(command)
        );

        const disposable = vscode.tasks.onDidEndTaskProcess((e) => {
            if (e.execution.task === task) {
                disposable.dispose();
                if (e.exitCode === 0) {
                    resolve();
                } else {
                    const errorMessage = `Task failed with exit code ${e.exitCode}`;
                    reject(new Error(errorMessage));
                }
            }
        });

        vscode.tasks.executeTask(task).then(undefined, reject);
    });
}
