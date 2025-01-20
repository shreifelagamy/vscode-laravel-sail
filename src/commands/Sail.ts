import * as vscode from 'vscode';
import { EventBus } from '../eventBus';
import { runCommand, runTask } from '../utils';

export class Sail {
    private sailCommand: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('laravelSail');
        this.sailCommand = config.get<string>('sailPath', './vendor/bin/sail');
    }

    async up(detached = false) {
        await runTask(`${this.sailCommand} up ${detached ? '-d' : ''}`, 'Sail up');
        EventBus.fireDidChangeStatus();
    }

    async start(service?: string) {
        const command = service ? `${this.sailCommand} up ${service}` : `${this.sailCommand} up`;
        await runTask(command, `Starting ${service || 'all services'}`);
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

    async down() {
        await runTask(`${this.sailCommand} down`, 'Stopping all services');
        EventBus.fireDidChangeStatus();
    }

    async open() {
        await runCommand(`${this.sailCommand} open`);
    }

    async restart() {
        await runTask(`${this.sailCommand} restart`, 'Sail restarting');
    }

    async shell(isRoot = false) {
        await runTask(`${this.sailCommand} ${isRoot ? 'root-shell' : 'shell'}`, 'Opening Sail shell');
    }

    async bash(isRoot = false) {
        await runTask(`${this.sailCommand} ${isRoot ? 'root-bash' : 'bash'}`, 'Opening Sail bash');
    }

    async tinker() {
        await runTask(`${this.sailCommand} tinker`, 'Opening Sail tinker');
    }
}