import * as vscode from 'vscode';
import { getNonce } from '../utils';

export class HtmlProvider {
    constructor(private readonly _extensionUri: vscode.Uri) { }

    private getStyleUri(webview: vscode.Webview): vscode.Uri {
        return webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
    }

    public getHtmlForWebview(webview: vscode.Webview): string {
        const nonce = getNonce();
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        const styleUri = this.getStyleUri(webview);

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${codiconsUri}" rel="stylesheet">
                <link href="${styleUri}" rel="stylesheet">

                <title>Laravel Sail</title>
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

    public getSailInstalledHtml(webview: vscode.Webview): string {
        const nonce = getNonce();
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        const styleUri = this.getStyleUri(webview);

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${codiconsUri}" rel="stylesheet">
                <link href="${styleUri}" rel="stylesheet">

                <title>Laravel Sail</title>
            </head>
            <body>
                <p>INFO: Sail scaffolding installed successfully. You may run your Docker containers using Sail's "up" command.</p>
                <button class="button" id="sailUpButton"><i class="codicon codicon-play"></i>Run Sail Up</button>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    document.getElementById('sailUpButton').addEventListener('click', () => {
                        vscode.postMessage({ command: 'sailUp' });
                    });
                </script>
            </body>
            </html>`;
    }

    public getNotLaravelHtml(webview: vscode.Webview): string {
        const nonce = getNonce();
        const styleUri = this.getStyleUri(webview);

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Laravel Sail</title>
            </head>
            <body>
                <p>Hey there! It looks like this isn't a Laravel project. Maybe it's time to start using Laravel? 😉</p>
            </body>
            </html>`;
    }

    public getDockerNotRunningHtml(webview: vscode.Webview): string {
        const nonce = getNonce();
        const styleUri = this.getStyleUri(webview);

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Laravel Sail</title>
            </head>
            <body>
                <p style="color: red;">WARNING: Docker is not running. Please start Docker to use Laravel Sail.</p>
            </body>
            </html>`;
    }

    public getSailStatusHtml(webview: vscode.Webview, status: string, dockerComposePath: string | null): string {
        const nonce = getNonce();
        const styleUri = this.getStyleUri(webview);
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        const statusColor = status === 'working' ? 'green' : status === 'warning' ? 'yellow' : 'red';
        const statusIcon = status === 'working' ? 'check' : status === 'warning' ? 'alert' : 'error';

        const composeFileStatus = dockerComposePath ? 'Exists' : 'Not Found';
        const composeFileColor = dockerComposePath ? 'green' : 'red';
        const composeFileIcon = dockerComposePath ? 'check' : 'error';

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${codiconsUri}" rel="stylesheet">
                <link href="${styleUri}" rel="stylesheet">
                <title>Sail Status</title>
            </head>
            <body>
                <p class="status" style="color: ${statusColor};">
                    <i class="codicon codicon-${statusIcon}"></i> Sail Status: <b>${status.toUpperCase()}</b>
                </p>
                <p class="status" style="color: ${composeFileColor};">
                    <i class="codicon codicon-${composeFileIcon}"></i> Docker Compose File: <b>${composeFileStatus.toUpperCase()}</b>
                </p>
                ${this.getSidebarHtml(status, dockerComposePath)}
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    function handleAction(command) {
                        vscode.postMessage({ command: command });
                    }
                </script>
            </body>
            </html>
        `;
    }

    private getSidebarHtml(status: string, dockerComposePath: string | null): string {
        let html = '<div class="sidebar">';

        if (dockerComposePath) {
            if (status === 'stopped') {
                html += `
                    <button class="button" onclick="handleAction('sailUp')"><i class="codicon codicon-play"></i>Up</button>
                    <button class="button" onclick="handleAction('sailUpDetached')"><i class="codicon codicon-debug-disconnect"></i>Up (Detached)</button>
                `;
            } else { // sail is running
                html += `
                    <button class="button" onclick="handleAction('sailOpen')"><i class="codicon codicon-globe"></i>Open in Browser</button>
                    <button class="button" onclick="handleAction('sailDown')"><i class="codicon codicon-debug-stop"></i>Down</button>
                    <button class="button" onclick="handleAction('sailRestart')"><i class="codicon codicon-refresh"></i>Restart</button>
                    <button class="button" onclick="handleAction('migrate')"><i class="codicon codicon-database"></i>Migrate</button>
                    <button class="button" onclick="handleAction('sailShell')"><i class="codicon codicon-terminal"></i>Shell</button>
                    <button class="button" onclick="handleAction('sailBash')"><i class="codicon codicon-terminal-bash"></i>Bash</button>
                    <button class="button" onclick="handleAction('sailTinker')"><i class="codicon codicon-tools"></i>Tinker</button>
                `;
            }

            html += `
                <button class="button" onclick="handleAction('openDockerCompose')"><i class="codicon codicon-file"></i>Open Docker Compose</button>
            `;
        } else {
            html += `
                <button class="button" onclick="handleAction('sailInstall')"><i class="codicon codicon-cloud-upload"></i>Publish Docker Compose</button>
            `;
        }

        html += '</div>';

        return html;
    }
}


