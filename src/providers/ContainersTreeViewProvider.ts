import * as vscode from 'vscode';
import { runCommand } from '../utils';

export class ContainersTreeViewProvider implements vscode.TreeDataProvider<SailContainer | SailPort> {
    private _onDidChangeTreeData: vscode.EventEmitter<SailContainer | undefined | null> = new vscode.EventEmitter<SailContainer | undefined | null>();
    readonly onDidChangeTreeData: vscode.Event<SailContainer | undefined | null> = this._onDidChangeTreeData.event;

    constructor() {
        this.checkSailStatus();
    }

    private async checkSailStatus() {
        setInterval(async () => {
            this._onDidChangeTreeData.fire();
        }, 10000); // Check every 10 seconds
    }

    getChildren(element?: SailContainer): Thenable<(SailContainer | SailPort)[]> {
        if (element) {
            return Promise.resolve(element.ports.map(port => new SailPort(port)));
        }

        return new Promise((resolve) => {
            this.getSailContainers().then(containers => {
                resolve(containers.map(container => new SailContainer(container.name, container.state, container.ports, container.image)));
            });
        });
    }

    private async getSailContainers(): Promise<{ name: string, state: string, ports: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], image: string }[]> {
        try {
            const result = await runCommand('./vendor/bin/sail ps --format json');
            const output = result.trim().split('\n');

            const containers = output.map(line => JSON.parse(line));

            return containers.map((container: { Names: string, State: string, Publishers: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], Image: string }) => ({
                name: container.Names,
                state: container.State,
                ports: container.Publishers,
                image: container.Image
            }));
        } catch (error) {
            console.error(`sail: ${error}`);
            return [];
        }
    }

    getTreeItem(element: SailContainer | SailPort): vscode.TreeItem {
        return element;
    }
}

class SailContainer extends vscode.TreeItem {
    constructor(
        public readonly name: string,
        public readonly state: string,
        public readonly ports: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[],
        public readonly image: string
    ) {
        super(name, vscode.TreeItemCollapsibleState.Collapsed);
        this.contextValue = 'sailContainer';
        this.description = `${image}`;
        this.iconPath = new vscode.ThemeIcon(state === 'running' ? 'circle-filled' : 'circle-outline', new vscode.ThemeColor(state === 'running' ? 'charts.green' : 'charts.red'));
    }
}

class SailPort extends vscode.TreeItem {
    constructor(
        public readonly port: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }
    ) {
        super(`${port.URL}:${port.PublishedPort} -> ${port.TargetPort}/${port.Protocol}`, vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'sailPort';
        this.iconPath = new vscode.ThemeIcon('plug');
    }
}
