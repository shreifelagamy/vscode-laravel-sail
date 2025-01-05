import * as vscode from 'vscode';
import { runTaskWithProgress } from '../utils';

export class Artisan {
    private artisanCommand: string;
    private sailCommand: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('laravelSail');
        this.artisanCommand = config.get<string>('artisanPath', 'artisan');
        this.sailCommand = config.get<string>('sailPath', './vendor/bin/sail');
    }

    async sailInstall() {
        await runTaskWithProgress(`${this.artisanCommand} sail:install`, 'Publishing Docker Compose and Updating .env', true);
    }

    async migrate() {
        await runTaskWithProgress(`${this.sailCommand} ${this.artisanCommand} migrate`, 'Running Sail Migrate');
    }
}
