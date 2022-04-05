import * as vscode from 'vscode';
import Server from './commands/Serve';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.startSail", () => { Server.run() }))
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.stopSail", () => { Server.stop() }))
}

// this method is called when your extension is deactivated
export function deactivate() {
    Server.stop()
}
