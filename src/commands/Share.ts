import { TaskScope, workspace } from "vscode";
import Common from "../Common";
import { executeAsTask } from "../utils/ExecuteAsTask";

export default class Share extends Common {
    public static async run() {
        await executeAsTask("./vendor/bin/sail share", "Sail share", { focus: true, workspaceFolder: workspace.workspaceFolders[0] });
    }
}