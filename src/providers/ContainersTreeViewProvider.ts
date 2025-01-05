import * as vscode from 'vscode';
import { sailContainers } from '../extension';

export class ContainersTreeViewProvider implements vscode.TreeDataProvider<SailContainer | SailPort> {
    private _onDidChangeTreeData: vscode.EventEmitter<SailContainer | undefined | null> = new vscode.EventEmitter<SailContainer | undefined | null>();
    readonly onDidChangeTreeData: vscode.Event<SailContainer | undefined | null> = this._onDidChangeTreeData.event;

    getChildren(element?: SailContainer): Thenable<(SailContainer | SailPort)[]> {
        if (element) {
            return Promise.resolve(element.ports.map(port => new SailPort(port)));
        }

        if (typeof sailContainers === 'undefined' || sailContainers.length === 0) {
            return Promise.resolve([]);
        }

        return Promise.resolve(sailContainers.map(container => new SailContainer(container.service, container.state, container.ports, container.image, container.status)));
    }

    getTreeItem(element: SailContainer | SailPort): vscode.TreeItem {
        return element;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class SailContainer extends vscode.TreeItem {
    constructor(
        public readonly service: string,
        public readonly state: string,
        public readonly ports: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[],
        public readonly image: string,
        public readonly status: string
    ) {
        super(service, vscode.TreeItemCollapsibleState.Collapsed);
        this.contextValue = `sailContainer_${status}`;
        this.description = `${image} (${status})`;
        this.iconPath = new vscode.ThemeIcon(
            status === 'running' ? 'play' : status === 'paused' ? 'debug-pause' : 'archive',
            new vscode.ThemeColor(status === 'running' ? 'charts.green' : status === 'paused' ? 'charts.yellow' : 'charts.red')
        );
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