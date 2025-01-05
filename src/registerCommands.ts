import * as vscode from 'vscode';
import { Artisan } from './commands/Artisan';
import { Composer } from './commands/Composer';
import { Sail } from './commands/Sail';
import Route from './commands/artisan/Route';
import { EventBus } from './eventBus';
import type { SailContainer } from './providers/ContainersTreeViewProvider';

const sail = new Sail();
const composer = new Composer();
const artisan = new Artisan();

export function registerCommands(context: vscode.ExtensionContext) {
    const commands = [
        { id: "larave-sail.routeList", run: () => Route.run() },
        { id: 'laravelSail.refresh', run: () => EventBus.fireDidChangeStatus() },
        {
            id: 'laravelSail.delete', run: async () => {
                await sail.down()
                await composer.removeSail()
            }
        },
        { id: 'laravelSail.killService', run: async (node: SailContainer) => await sail.kill(node.service) },
        { id: 'laravelSail.pauseService', run: async (node: SailContainer) => await sail.pause(node.service) },
        { id: 'laravelSail.startService', run: async (node: SailContainer) => await sail.start(node.service) },
        { id: 'laravelSail.unpauseService', run: async (node: SailContainer) => await sail.unpause(node.service) },
        { id: 'laravelSail.statsService', run: async (node: SailContainer) => await sail.stats(node.service) },
        { id: 'laravelSail.open', run: async (node: SailContainer) => await sail.open() },
        { id: 'laravelSail.restart', run: async () => await sail.restart() }
    ];

    for (const command of commands) {
        context.subscriptions.push(vscode.commands.registerCommand(command.id, command.run));
    }
}
