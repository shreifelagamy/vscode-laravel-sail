import { Terminal, window, workspace } from "vscode"
import Common from "../Common"
import { executeAsTask } from "../utils/ExecuteAsTask"

export default class Server extends Common {
    private static terminal: Terminal
    private static host: string
    private static port: string

    public static async run() {
        await executeAsTask("./vendor/bin/sail up", "Sail up", { focus: true, workspaceFolder: workspace.workspaceFolders[0] });
    }

    public static async stop() {
        await executeAsTask("./vendor/bin/sail down", "Sail Down", { focus: true, workspaceFolder: workspace.workspaceFolders[0] });
    }
}