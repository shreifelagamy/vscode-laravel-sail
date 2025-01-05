import * as vscode from 'vscode';
import { getNonce } from '../utils';

export class HtmlProvider {
    constructor(private readonly _extensionUri: vscode.Uri) {}

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

    public getSailRunningHtml(webview: vscode.Webview): string {
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
                <p>INFO: Sail containers are running:</p>
                <div class="container">
                    <span>Container 1</span>
                    <span class="running">Running</span>
                </div>
                <div class="container">
                    <span>Container 2</span>
                    <span class="running">Running</span>
                </div>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
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

    public getSailStatusHtml(webview: vscode.Webview, status: string, dockerComposeExists: boolean): string {
        const nonce = getNonce();
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        const styleUri = this.getStyleUri(webview);
        const statusColor = status === 'green' ? 'green' : status === 'yellow' ? 'yellow' : 'red';
        const statusLabel = status === 'green' ? 'Running' : status === 'yellow' ? 'Partially Running' : 'Stopped';
        const statusIcon = status === 'green' ? 'check' : status === 'yellow' ? 'warning' : 'error';
        const sailUpButton = status === 'red' ? '<button class="button" onclick="sailUp()"><i class="codicon codicon-play"></i>Sail Up</button>' : '';
        const publishStatus = dockerComposeExists ? 'Published' : 'Not Published';
        const publishIcon = dockerComposeExists ? 'check' : 'cloud-upload';
        const publishColor = dockerComposeExists ? 'green' : 'red';
        const publishButton = dockerComposeExists ? '' : '<button class="button" onclick="publish()"><i class="codicon codicon-cloud-upload"></i>Publish</button>';

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
                <p>Sail Status: <i class="codicon codicon-${statusIcon}" style="color: ${statusColor};"></i> <span style="color: ${statusColor};">${statusLabel}</span></p>
                ${sailUpButton}
                <p>Docker Compose: <i class="codicon codicon-${publishIcon}" style="color: ${publishColor};"></i> <span style="color: ${publishColor};">${publishStatus}</span></p>
                ${publishButton}
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    function sailUp() {
                        vscode.postMessage({ command: 'sailUp' });
                    }
                    function publish() {
                        vscode.postMessage({ command: 'publish' });
                    }
                </script>
            </body>
            </html>`;
    }
}
