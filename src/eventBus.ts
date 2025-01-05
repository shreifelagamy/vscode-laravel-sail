import * as vscode from 'vscode';

export const onDidChangeStatus = new vscode.EventEmitter<void>();

export const EventBus = {
    onDidChangeStatusEvent: onDidChangeStatus.event,
    fireDidChangeStatus: () => onDidChangeStatus.fire()
};
