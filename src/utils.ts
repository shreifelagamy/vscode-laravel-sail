import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import * as vscode from 'vscode';

async function checkWSL2(): Promise<boolean> {
    if (process.platform !== 'win32') {
        return true;
    }

    return new Promise((resolve) => {
        // First check if WSL is installed at all
        exec('where wsl', (error) => {
            if (error) {
                resolve(false);
                return;
            }

            // Then check WSL version and status
            exec('wsl --set-default-version 2 2>&1', (error, stdout, stderr) => {
                // If this command runs without error and doesn't contain "WSL 2 installation is incomplete",
                // then WSL2 is properly installed
                if (error || stderr.includes('WSL 2 installation is incomplete')) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    });
}

function wrapCommandForWSL(command: string): string {
    return process.platform === 'win32' ? `wsl ${command}` : command;
}

export async function runTaskWithProgress(command: string, taskName: string, usePHP = false): Promise<void> {
    // Check WSL2 availability first
    if (process.platform === 'win32') {
        const hasWSL2 = await checkWSL2();
        if (!hasWSL2) {
            throw new Error('WSL2 is required to run Laravel Sail on Windows. Please ensure:\n1. WSL2 is installed (run "wsl --install")\n2. Docker Desktop is configured to use WSL2 backend\n3. Your terminal has access to WSL commands');
        }
    }

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
            if (error instanceof Error) {
                vscode.window.showErrorMessage(error.message);
            } else {
                vscode.window.showErrorMessage('An unknown error occurred.');
            }
        }
    });
}

export async function runTask(command: string, taskName: string): Promise<void> {
    // Check WSL2 availability first
    if (process.platform === 'win32') {
        const hasWSL2 = await checkWSL2();
        if (!hasWSL2) {
            throw new Error('WSL2 is required to run Laravel Sail on Windows. Please ensure:\n1. WSL2 is installed (run "wsl --install")\n2. Docker Desktop is configured to use WSL2 backend\n3. Your terminal has access to WSL commands');
        }
    }

    console.log(`SAIL: Running task: ${command}`);

    return new Promise((resolve, reject) => {
        const wrappedCommand = wrapCommandForWSL(command);
        const shellExecution = process.platform === 'win32'
            ? new vscode.ShellExecution(wrappedCommand, { executable: 'wsl.exe' })
            : new vscode.ShellExecution(wrappedCommand);

        const task = new vscode.Task(
            { type: 'shell' },
            vscode.TaskScope.Workspace,
            taskName,
            'shell',
            shellExecution
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
    // Use forward slashes for PHP path on WSL
    const normalizedPhpPath = process.platform === 'win32' ? phpPath.replace(/\\/g, '/') : phpPath;
    const fullCommand = `${normalizedPhpPath} ${command}`;
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
    // Check WSL2 availability first
    if (process.platform === 'win32') {
        const hasWSL2 = await checkWSL2();
        if (!hasWSL2) {
            throw new Error('WSL2 is required to run Laravel Sail on Windows. Please ensure:\n1. WSL2 is installed (run "wsl --install")\n2. Docker Desktop is configured to use WSL2 backend\n3. Your terminal has access to WSL commands');
        }
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    return new Promise((resolve, reject) => {
        const wrappedCommand = wrapCommandForWSL(command);
        exec(wrappedCommand, { cwd: rootPath }, (error, stdout, stderr) => {
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
