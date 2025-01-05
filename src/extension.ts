import * as vscode from 'vscode';
import { registerCommands } from './registerCommands';
import { EventBus } from './eventBus';
import { Sail } from './commands/Sail';
import { ContainersTreeViewProvider } from './providers/ContainersTreeViewProvider';
import { DashboardWebViewProvider } from './providers/DashboardWebViewProvider';

export let sailContainers: { service: string, state: string, ports: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], image: string, status: string }[] = [];
export let isDockerRunning = true;

const sail = new Sail();

async function checkSailStatus() {
    setInterval(async () => {
        try {
            sailContainers = await sail.ps();
            isDockerRunning = true;
        } catch (error) {
            console.error(`sail: ${error}`);
            sailContainers = [];
            isDockerRunning = error instanceof Error && !error.message.includes('Docker is not running');
        }
        EventBus.fireDidChangeStatus();
    }, 5000); // Check every 5 seconds
}

export function activate(context: vscode.ExtensionContext) {
    registerCommands(context);

    const provider = new DashboardWebViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(DashboardWebViewProvider.viewId, provider)
    );

    const treeViewProvider = new ContainersTreeViewProvider();
    vscode.window.createTreeView('laravel-sail-containers', { treeDataProvider: treeViewProvider });

    EventBus.onDidChangeStatusEvent(() => {
        console.log("sail: EventBus.onDidChangeStatusEvent")
        provider.refresh();
        treeViewProvider.refresh();
    });

    checkSailStatus();
}

// this method is called when your extension is deactivated
export function deactivate() {
}