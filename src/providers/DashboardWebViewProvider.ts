import * as vscode from 'vscode';
import { isLaravelProject, isSailInstalled } from '../utils';
import { HtmlProvider } from './HtmlProvider';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { sailContainers, isDockerRunning, isLoading } from '../extension';
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
    private dockerComposePath: string | null = null;

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
                            }
                        }
                    }
                    break;
                case 'reload':
                    this.updateWebviewContent(webviewView);
                    break;
                case 'sailUp':
                    await this.sail.up();
                    this.updateWebviewContent(webviewView);
                    break;
                case 'publish':
                    await this.artisan.sailInstall();
                    this.updateWebviewContent(webviewView);
                    break;
                case 'sailDown':
                    await this.sail.down();
                    this.updateWebviewContent(webviewView);
                    break;
                case 'sailUpDetached':
                    await this.sail.up(true);
                    this.updateWebviewContent(webviewView);
                    break;
                case 'sailInstall':
                    await this.artisan.sailInstall();
                    this.updateWebviewContent(webviewView);
                    break;
                case 'migrate':
                    await this.artisan.migrate();
                    this.updateWebviewContent(webviewView);
                    break;
                case 'openDockerCompose':
                    if (this.dockerComposePath) {
                        const document = await vscode.workspace.openTextDocument(this.dockerComposePath);
                        await vscode.window.showTextDocument(document);
                    }
                    break;
                case 'sailOpen':
                    await this.sail.open();
                    break;
                case 'sailRestart':
                    await this.sail.restart();
                    this.updateWebviewContent(webviewView);
                    break;
                case 'sailShell':
                    {
                        const shouldUseRoot = await vscode.window.showQuickPick(['Yes', 'No'], {
                            placeHolder: 'Do you want to use root access?'
                        });

                        await this.sail.shell(shouldUseRoot === 'Yes');
                    }
                    break;
                case 'sailBash':
                    {
                        const shouldUseRoot = await vscode.window.showQuickPick(['Yes', 'No'], {
                            placeHolder: 'Do you want to use root access?'
                        });

                        await this.sail.bash(shouldUseRoot === 'Yes');
                    }
                    break;
                case 'sailTinker':
                    await this.sail.tinker();
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
            return 'working';
        }

        if (upCount > 0) {
            return 'warning';
        }

        return 'stopped';
    }

    private async updateWebviewContent(webviewView: vscode.WebviewView) {
        if (isLoading) {
            webviewView.webview.html = this._htmlProvider.getLoadingHtml(webviewView.webview);
            return;
        }

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
            this.dockerComposePath = fs.existsSync(path.join(vscode.workspace.rootPath || '', 'docker-compose.yml')) ? path.join(vscode.workspace.rootPath || '', 'docker-compose.yml') : null;
            webviewView.webview.html = this._htmlProvider.getSailStatusHtml(webviewView.webview, status, this.dockerComposePath);
        }
    }

    private showSailInstalledMessage() {
        if (this._view) {
            this._view.webview.html = this._htmlProvider.getSailInstalledHtml(this._view.webview);
        }
    }
}

