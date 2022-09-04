import * as os from 'os';
import * as vscode from 'vscode';

interface ExecuteAsTaskOptions {
    workspaceFolder?: vscode.WorkspaceFolder;
    cwd?: string;
    alwaysRunNew?: boolean;
    rejectOnError?: boolean;
    focus?: boolean;
}

export async function executeAsTask(command: string, name: string, options: ExecuteAsTaskOptions): Promise<void> {
    options = options ?? {};

    const task = new vscode.Task(
        { type: 'shell' },
        options.workspaceFolder ?? vscode.TaskScope.Workspace,
        name,
        'Laravel Sail',
        new vscode.ShellExecution(command, { cwd: options.cwd || options.workspaceFolder?.uri?.fsPath || os.homedir() }),
        [] // problemMatchers
    );

    if (options.alwaysRunNew) {
        // If the command should always run in a new task (even if an identical command is still running), add a random value to the definition
        // This will cause a new task to be run even if one with an identical command line is already running
        task.definition.idRandomizer = Math.random();
    }

    if (options.focus) {
        task.presentationOptions = {
            focus: true,
        };
    }

    const taskExecution = await vscode.tasks.executeTask(task);

    const taskEndPromise = new Promise<void>((resolve, reject) => {
        const disposable = vscode.tasks.onDidEndTaskProcess(e => {
            if (e.execution === taskExecution) {
                disposable.dispose();

                if (e.exitCode && options.rejectOnError) {
                    reject(e.exitCode);
                }

                resolve();
            }
        });
    });

    return taskEndPromise;
}