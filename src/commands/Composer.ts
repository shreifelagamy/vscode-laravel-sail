import * as vscode from 'vscode';
import { EventBus } from '../eventBus';
import { runTaskWithProgress } from '../utils';

export class Composer {
    private composerCommand: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('laravelSail');
        this.composerCommand = config.get<string>('composerPath', 'composer');
    }

    async installSail(dev = false) {
        const command = dev ? `${this.composerCommand} require laravel/sail --dev` : `${this.composerCommand} require laravel/sail`;
        await runTaskWithProgress(command, 'Installing Laravel Sail');
        EventBus.fireDidChangeStatus();
    }

    async removeSail() {
        await runTaskWithProgress(`${this.composerCommand} remove laravel/sail`, 'Removing Laravel Sail');
        EventBus.fireDidChangeStatus();
    }
}
