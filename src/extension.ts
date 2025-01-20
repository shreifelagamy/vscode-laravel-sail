import * as vscode from 'vscode';
import { Sail } from './commands/Sail';
import { EventBus } from './eventBus';
import { ContainersTreeViewProvider, DashboardWebViewProvider } from './providers';
import { registerCommands } from './registerCommands';

export let sailContainers: { service: string, state: string, ports: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], image: string, status: string }[] = [];
export let isDockerRunning = true;
export let isLoading = true;

const sail = new Sail();
let statusCheckInterval: NodeJS.Timeout;

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
    statusCheckInterval = setInterval(async () => {
        await checkSailStatus();
    }, interval);
}

export function activate(context: vscode.ExtensionContext) {
    registerCommands(context);

    // Show star request message once
    const hasShownStarMessage = context.globalState.get('hasShownStarMessage');
    if (!hasShownStarMessage) {
        const action = '⭐ Star on GitHub';
        vscode.window.showInformationMessage(
            '❤️ Enjoying Laravel Sail extension? Show your support by giving us a star! 🌟',
            action
        ).then(selection => {
            if (selection === action) {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/shreifelagamy/vscode-laravel-sail'));
            }
        });
        context.globalState.update('hasShownStarMessage', true);
    }

    const provider = new DashboardWebViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(DashboardWebViewProvider.viewId, provider)
    );

    const treeViewProvider = new ContainersTreeViewProvider();
    vscode.window.createTreeView('laravel-sail-containers', { treeDataProvider: treeViewProvider });

    EventBus.onDidChangeStatusEvent(() => {
        console.log("sail: EventBus.onDidChangeStatusEvent");
        provider.refresh();
        treeViewProvider.refresh();
    });

    startSailStatusCheck();
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
    }
}