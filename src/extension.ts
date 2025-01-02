import * as vscode from 'vscode';
import Server from './commands/Serve';
import Share from './commands/Share';
import Route from './commands/artisan/Route';
import { SailSidebarProvider } from './providers/SailSidebarProvider';
import { runTaskWithProgress } from './utils';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.startSail", () => { Server.run() }))
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.stopSail", () => { Server.stop() }))
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.share", () => { Share.run() }))

    // Route
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.routeList", () => { Route.run() }))

    const provider = new SailSidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SailSidebarProvider.viewId, provider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.refresh', () => {
            provider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.delete', async () => {
            await runTaskWithProgress('composer remove laravel/sail', 'Removing Laravel Sail');
            provider.refresh();
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
    Server.stop()
}