import * as vscode from 'vscode';
import { registerCommands } from './registerCommands';
import { EventBus } from './eventBus';
import { Sail } from './commands/Sail';
import { ContainersTreeViewProvider, DashboardWebViewProvider } from './providers';

export let sailContainers: { service: string, state: string, ports: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], image: string, status: string }[] = [];
export let isDockerRunning = true;
export let isLoading = true;

const sail = new Sail();

async function checkSailStatus() {
    try {
        sailContainers = await sail.ps();
        isDockerRunning = true;
    } catch (error) {
        console.error(`sail: ${error}`);
        sailContainers = [];
        isDockerRunning = error instanceof Error && !error.message.includes('Docker is not running');
    } finally {
        isLoading = false;
        EventBus.fireDidChangeStatus();
    }
}


async function startSailStatusCheck() {
    // Initial check
    await checkSailStatus();

    // Get interval from configuration
    const config = vscode.workspace.getConfiguration('laravelSail');
    const interval = config.get<number>('checkInterval', 5000);

    // Start periodic checks
    setInterval(async () => {
        await checkSailStatus();
    }, interval);
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

    startSailStatusCheck();
}

// this method is called when your extension is deactivated
export function deactivate() {
}