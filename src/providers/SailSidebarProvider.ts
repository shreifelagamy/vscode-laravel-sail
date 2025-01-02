import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { runTaskWithProgress, runTask } from '../utils';

export class SailSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewId = 'laravel-sail-main';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        this.updateWebviewContent(webviewView);

        webviewView.webview.onDidReceiveMessage(async message => {
            switch (message.command) {
                case 'install':
                    {
                        const installInDev = await vscode.window.showQuickPick(['Yes', 'No'], {
                            placeHolder: 'Do you want to install Laravel Sail in the dev dependencies?'
                        });

                        if (installInDev) {
                            const command = installInDev === 'Yes' ? 'composer require laravel/sail --dev' : 'composer require laravel/sail';
                            await runTaskWithProgress(command, 'Installing Laravel Sail');
                            this.refresh();

                            const publishDockerCompose = await vscode.window.showQuickPick(['Yes', 'No'], {
                                placeHolder: 'Do you want to publish the Docker Compose file and update the .env file?'
                            });

                            if (publishDockerCompose === 'Yes') {
                                await runTaskWithProgress('php artisan sail:install', 'Publishing Docker Compose and Updating .env');
                            }
                        }
                    }
                    break;
                case 'reload':
                    this.updateWebviewContent(webviewView);
                    break;
            }
        });
    }

    public refresh() {
        if (this._view) {
            this.updateWebviewContent(this._view);
        }
    }

    private updateWebviewContent(webviewView: vscode.WebviewView) {
        if (this.isLaravelProject() && !this.isSailInstalled()) {
            webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        } else {
            webviewView.webview.html = '<p>Laravel Sail is already installed or this is not a Laravel project.</p>';
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const nonce = getNonce();
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${codiconsUri}" rel="stylesheet">

                <title>Laravel Sail</title>
                <style>
                p {
                    font-size: 13px;
                    color: rgb(195, 198, 204);
                    line-height: 1.2rem;
                    margin-block-end: 0;
                }
                .button {
                    margin-block-start: 1em;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: 1px solid var(--vscode-button-border);
                    padding: 6px 10px;
                    border-radius: 2px;
                    cursor: pointer;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .codicon {
                    margin-right: 5px;
                }
            </style>
            </head>
            <body>
                <p>It seems like Laravel Sail is not installed in your project. You can install it using the button below:</p>
                <button class="button" id="installButton"><i class="codicon codicon-cloud-download"></i>Install Laravel Sail</button>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    document.getElementById('installButton').addEventListener('click', () => {
                        vscode.postMessage({ command: 'install' });
                    });
                </script>
            </body>
            </html>`;
    }

    private isLaravelProject(): boolean {
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

    private isSailInstalled(): boolean {
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
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

