import * as vscode from 'vscode';
import Server from './commands/Serve';

// Route
import Route from './commands/artisan/Route';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.startSail", () => { Server.run() }))
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.stopSail", () => { Server.stop() }))
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.startDetachedSail", () => { Server.runDetached() }))

    // Route
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.routeList", () => { Route.run() }))
}

// this method is called when your extension is deactivated
export function deactivate() {
    Server.stop()
}
