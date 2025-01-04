import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { exec } from 'node:child_process';

export async function runTaskWithProgress(command: string, taskName: string, usePHP = false): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: taskName,
        cancellable: false
    }, async (progress) => {
        try {
            if (usePHP) {
                await runPHPTask(command, taskName);
            } else {
                await runTask(command, taskName);
            }
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

export async function runPHPTask(command: string, taskName: string): Promise<void> {
    const phpPath = vscode.workspace.getConfiguration('laravelSail').get<string>('phpPath') || 'php';
    const fullCommand = `${phpPath} ${command}`;
    await runTask(fullCommand, taskName);
}

export function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function isLaravelProject(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const composerJsonPath = path.join(rootPath, 'composer.json');

    if (!fs.existsSync(composerJsonPath)) {
        return false;
    }

    const composerJson = JSON.parse(fs.readFileSync(composerJsonPath, 'utf8'));
    return composerJson.require?.['laravel/framework'];
}

export function isSailInstalled(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const composerJsonPath = path.join(rootPath, 'composer.json');

    if (!fs.existsSync(composerJsonPath)) {
        return false;
    }

    const composerJson = JSON.parse(fs.readFileSync(composerJsonPath, 'utf8'));
    return composerJson.require?.['laravel/sail'] || composerJson['require-dev']?.['laravel/sail'];
}

export async function runCommand(command: string): Promise<string> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    return new Promise((resolve, reject) => {
        exec(command, { cwd: rootPath }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else if (stderr) {
                reject(new Error(stderr));
            } else {
                resolve(stdout);
            }
        });
    });
}
