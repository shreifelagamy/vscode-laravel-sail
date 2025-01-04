import * as vscode from 'vscode';
import { runTaskWithProgress, isLaravelProject, isSailInstalled } from '../utils';
import { HtmlProvider } from './HtmlProvider';

export class SailSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewId = 'laravel-sail-main';
    private _view?: vscode.WebviewView;
    private readonly _htmlProvider: HtmlProvider;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this._htmlProvider = new HtmlProvider(this._extensionUri);
        // this.checkSailStatus();
    }

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
                                await runTaskWithProgress('artisan sail:install', 'Publishing Docker Compose and Updating .env', true);
                                this.showSailInstalledMessage();

                                const runMigration = await vscode.window.showQuickPick(['Yes', 'No'], {
                                    placeHolder: 'Do you want to run the database migrations?'
                                });

                                if (runMigration === 'Yes') {
                                    await runTaskWithProgress('./vendor/bin/sail artisan migrate', 'Running Sail Migrate');
                                }
                            }
                        }
                    }
                    break;
                case 'reload':
                    this.updateWebviewContent(webviewView);
                    break;
                case 'sailUp':
                    await runTaskWithProgress('./vendor/bin/sail up', 'Running Sail Up');
                    break;
            }
        });
    }

    public refresh() {
        if (this._view) {
            this.updateWebviewContent(this._view);
        }
    }

    private async checkSailStatus() {
        setInterval(async () => {
            const isRunning = await this.isSailRunning();
            if (this._view) {
                this.updateWebviewContent(this._view, isRunning);
            }
        }, 5000); // Check every 5 seconds
    }

    private async isSailRunning(): Promise<boolean> {
        try {
            const result = await runTaskWithProgress('./vendor/bin/sail ps', 'Checking Sail Status', true);
            return result.includes('Up');
        } catch {
            return false;
        }
    }

    private updateWebviewContent(webviewView: vscode.WebviewView, isRunning = false) {
        if (!isLaravelProject()) {
            webviewView.webview.html = this._htmlProvider.getNotLaravelHtml(webviewView.webview);
        } else if (!isSailInstalled()) {
            webviewView.webview.html = this._htmlProvider.getHtmlForWebview(webviewView.webview);
        } else if (isRunning) {
            webviewView.webview.html = this._htmlProvider.getSailRunningHtml(webviewView.webview);
        } else {
            webviewView.webview.html = this._htmlProvider.getSailInstalledHtml(webviewView.webview);
        }
    }

    private showSailInstalledMessage() {
        if (this._view) {
            this._view.webview.html = this._htmlProvider.getSailInstalledHtml(this._view.webview);
        }
    }
}

