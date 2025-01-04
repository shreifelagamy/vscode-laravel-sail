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
}
