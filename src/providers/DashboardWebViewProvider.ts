import * as vscode from 'vscode';
import { isLaravelProject, isSailInstalled } from '../utils';
import { HtmlProvider } from './HtmlProvider';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { sailContainers, isDockerRunning } from '../extension';
import { Sail } from '../commands/Sail';
import { Composer } from '../commands/Composer';
import { Artisan } from '../commands/Artisan';

export class DashboardWebViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewId = 'laravel-sail-main';
    private _view?: vscode.WebviewView;
    private readonly _htmlProvider: HtmlProvider;
    private readonly sail: Sail;
    private readonly composer: Composer;
    private readonly artisan: Artisan;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this._htmlProvider = new HtmlProvider(this._extensionUri);
        this.sail = new Sail();
        this.composer = new Composer();
        this.artisan = new Artisan();
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
                            await this.composer.installSail(installInDev === 'Yes');
                            this.refresh();

                            const publishDockerCompose = await vscode.window.showQuickPick(['Yes', 'No'], {
                                placeHolder: 'Do you want to publish the Docker Compose file and update the .env file?'
                            });

                            if (publishDockerCompose === 'Yes') {
                                await this.artisan.sailInstall();
                                this.showSailInstalledMessage();

                                const runMigration = await vscode.window.showQuickPick(['Yes', 'No'], {
                                    placeHolder: 'Do you want to run the database migrations?'
                                });

                                if (runMigration === 'Yes') {
                                    await this.artisan.migrate();
                                }
                            }
                        }
                    }
                    break;
                case 'reload':
                    this.updateWebviewContent(webviewView);
                    break;
                case 'sailUp':
                    await this.sail.start('');
                    this.updateWebviewContent(webviewView);
                    break;
                case 'publish':
                    await this.artisan.sailInstall();
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

    private getSailStatus(): string {
        const upCount = sailContainers.filter(container => container.state === 'running').length;
        if (upCount === sailContainers.length && upCount > 0) {
            return 'green';
        }

        if (upCount > 0) {
            return 'yellow';
        }

        return 'red';
    }

    private async updateWebviewContent(webviewView: vscode.WebviewView) {
        if (!isDockerRunning) {
            webviewView.webview.html = this._htmlProvider.getDockerNotRunningHtml(webviewView.webview);
            return;
        }

        if (!isLaravelProject()) {
            webviewView.webview.html = this._htmlProvider.getNotLaravelHtml(webviewView.webview);
        } else if (!isSailInstalled()) {
            webviewView.webview.html = this._htmlProvider.getHtmlForWebview(webviewView.webview);
        } else {
            const status = this.getSailStatus();
            const dockerComposeExists = fs.existsSync(path.join(vscode.workspace.rootPath || '', 'docker-compose.yml'));
            webviewView.webview.html = this._htmlProvider.getSailStatusHtml(webviewView.webview, status, dockerComposeExists);
        }
    }

    private showSailInstalledMessage() {
        if (this._view) {
            this._view.webview.html = this._htmlProvider.getSailInstalledHtml(this._view.webview);
        }
    }
}
