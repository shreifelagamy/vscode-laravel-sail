import { workspace } from "vscode";
import Common from "../Common";
import { executeAsTask } from "../utils/ExecuteAsTask";

export default class Share extends Common {
    public static async run() {
        if (workspace.workspaceFolders) {
            await executeAsTask("./vendor/bin/sail share", "Sail share", { focus: true, workspaceFolder: workspace?.workspaceFolders[0] || '' });
        } else {
            this.showError("Open a folder/workspace first");
        }
    }
}