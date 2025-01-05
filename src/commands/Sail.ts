import * as vscode from 'vscode';
import { EventBus } from '../eventBus';
import { runCommand, runTask } from '../utils';

export class Sail {
    private sailCommand: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('laravelSail');
        this.sailCommand = config.get<string>('sailPath', './vendor/bin/sail');
    }

    async start(service: string) {
        await runTask(`${this.sailCommand} up ${service}`, `Starting ${service}`);
        EventBus.fireDidChangeStatus();
    }

    async stop(service: string) {
        await runTask(`${this.sailCommand} down ${service}`, `Stopping ${service}`);
        EventBus.fireDidChangeStatus();
    }

    async kill(service: string) {
        await runTask(`${this.sailCommand} kill ${service}`, `Killing ${service}`);
        EventBus.fireDidChangeStatus();
    }

    async pause(service: string) {
        await runTask(`${this.sailCommand} pause ${service}`, `Pausing ${service}`);
        EventBus.fireDidChangeStatus();
    }

    async unpause(service: string) {
        await runTask(`${this.sailCommand} unpause ${service}`, `Unpausing ${service}`);
        EventBus.fireDidChangeStatus();
    }

    async ps(): Promise<{ service: string, state: string, ports: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], image: string, status: string }[]> {
        const result = await runCommand(`${this.sailCommand} ps --all --format json`);
        const output = result.trim().split('\n');
        return output.map(line => JSON.parse(line)).map((container: { Service: string, State: string, Publishers: { URL: string, TargetPort: number, PublishedPort: number, Protocol: string }[], Image: string, Status: string }) => ({
            service: container.Service,
            state: container.State,
            ports: container.Publishers,
            image: container.Image,
            status: container.Status.includes('Paused') ? 'paused' : container.Status.includes('Exited') ? 'killed' : 'running'
        }));
    }

    async stats(service: string) {
        await runTask(`${this.sailCommand} stats ${service}`, `Showing stats for ${service}`);
    }
}
