import * as cp from 'child_process';
import { window, workspace } from 'vscode';
import Output from "./utils/Output";

export default class Common {
    protected static async execCmd(command: string, callback: (info: {
        err: any
        stdout: string
        stderr: string
    }) => void) {
        command = `./vendor/bin/sail ${command}`

        let maxBuffer = 1024 * 200

        let path = workspace.workspaceFolders?.length ? workspace.workspaceFolders[0].uri.path : './'
        let cmd = process.platform == 'win32' ?
            // Windows command
            `cd /d ${path} && ${command}` :
            // Unix command
            `cd ${path} && ${command}`

        Output.command(command.trim())
        cp.exec(cmd, { maxBuffer }, async (err, stdout, stderr) => {
            if (err) {
                Output.error(err.message.trim())
                Output.showConsole()
            }
            await callback({
                err, stdout, stderr
            })
        })
    }

    protected static async execArtisanCmd(command: string, callback: (info: {
        err: any
        stdout: string
        stderr: string
    }) => void) {
        command = `./vendor/bin/sail artisan ${command}`

        let maxBuffer = 1024 * 200
        let path = workspace.workspaceFolders?.length ? workspace?.workspaceFolders[0]?.uri?.path : './'
        let cmd = process.platform == 'win32' ?
            // Windows command
            `cd /d ${path} && ${command}` :
            // Unix command
            `cd ${path} && ${command}`

        Output.command(command.trim())
        cp.exec(cmd, { maxBuffer }, async (err, stdout, stderr) => {
            if (err) {
                Output.error(err.message.trim())
                Output.showConsole()
            }
            await callback({
                err, stdout, stderr
            })
        })
    }

    protected static async showError(message: string, consoleErr = null) {
        if (consoleErr !== null) {
            message += ' (See output console for more details)'
            console.error(consoleErr + ' (See output console for more details)')
        }
        window.showErrorMessage(message)
        return false
    }
}