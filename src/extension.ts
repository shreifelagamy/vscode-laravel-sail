import * as vscode from 'vscode';
import Server from './commands/Serve';
import Share from './commands/Share';
import Route from './commands/artisan/Route';
import { ContainersTreeViewProvider } from './providers/ContainersTreeViewProvider';
import { DashboardWebViewProvider } from './providers/DashboardWebViewProvider';
import { runCommand, runTaskWithProgress } from './utils';

export let sailContainers: { service: string, state: string, ports: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], image: string }[] = [];
export let isDockerRunning = true;

async function checkSailStatus(provider: DashboardWebViewProvider, treeViewProvider: ContainersTreeViewProvider) {
    setInterval(async () => {
        try {
            const result = await runCommand('./vendor/bin/sail ps --format json');
            const output = result.trim().split('\n');
            sailContainers = output.map(line => JSON.parse(line)).map((container: { Service: string, State: string, Publishers: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], Image: string }) => ({
                service: container.Service,
                state: container.State,
                ports: container.Publishers,
                image: container.Image
            }));
            isDockerRunning = true;
        } catch (error) {
            console.error(`sail: ${error}`);
            sailContainers = [];
            isDockerRunning = !error.message.includes('Docker is not running');
        }
        provider.refresh();
        treeViewProvider.refresh();
    }, 5000); // Check every 5 seconds
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.startSail", () => { Server.run() }))
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.stopSail", () => { Server.stop() }))
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.share", () => { Share.run() }))

    // Route
    context.subscriptions.push(vscode.commands.registerCommand("larave-sail.routeList", () => { Route.run() }))
    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.refresh', () => provider.refresh())
    );

    const provider = new DashboardWebViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(DashboardWebViewProvider.viewId, provider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('laravelSail.delete', async () => {
            await runTaskWithProgress('composer remove laravel/sail', 'Removing Laravel Sail');
            provider.refresh();
        })
    );

    const treeViewProvider = new ContainersTreeViewProvider();
    vscode.window.createTreeView('laravel-sail-containers', { treeDataProvider: treeViewProvider });

    checkSailStatus(provider, treeViewProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {
    Server.stop()
}