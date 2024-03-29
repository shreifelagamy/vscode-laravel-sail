import { Terminal, workspace } from "vscode"
import Common from "../Common"
import { executeAsTask } from "../utils/ExecuteAsTask"

export default class Server extends Common {
    private static terminal: Terminal
    private static host: string
    private static port: string

    public static async run() {
        if (workspace.workspaceFolders) {
            await executeAsTask("./vendor/bin/sail up", "Sail up", { focus: true, workspaceFolder: workspace.workspaceFolders[0] });
        } else {
            this.showError("Open a folder/workspace first");
        }
    }

    public static async stop() {
        if (workspace.workspaceFolders) {
            await executeAsTask("./vendor/bin/sail down", "Sail Down", { focus: true, workspaceFolder: workspace.workspaceFolders[0] });
        } else {
            this.showError("Open a folder/workspace first");
        }
    }
}