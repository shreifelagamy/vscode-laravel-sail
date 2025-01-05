import * as vscode from 'vscode';
import { Artisan } from './commands/Artisan';
import { Composer } from './commands/Composer';
import { Sail } from './commands/Sail';
import Server from './commands/Serve';
import Share from './commands/Share';
import Route from './commands/artisan/Route';
import { EventBus } from './eventBus';
import type { SailContainer } from './providers/ContainersTreeViewProvider';

const sail = new Sail();
const composer = new Composer();
const artisan = new Artisan();

export function registerCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.startSail", () => { Server.run() }));
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.stopSail", () => { Server.stop() }));
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.share", () => { Share.run() }));

    // Route
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.routeList", () => { Route.run() }));
    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.refresh', () => EventBus.fireDidChangeStatus())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.delete', async () => {
            await composer.removeSail();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.killService', async (node: SailContainer) => {
            await sail.kill(node.service);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.pauseService', async (node: SailContainer) => {
            await sail.pause(node.service);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.startService', async (node: SailContainer) => {
            await sail.start(node.service);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.unpauseService', async (node: SailContainer) => {
            await sail.unpause(node.service);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.statsService', async (node: SailContainer) => {
            await sail.stats(node.service);
        })
    );
}
