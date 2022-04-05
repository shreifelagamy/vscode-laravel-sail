import { Terminal, window } from "vscode"

export default class Server {
    private static terminal: Terminal
    private static host: string
    private static port: string

    public static async run() {
        if (Server.terminal) {
            Server.terminal.dispose()
        }

        Server.terminal = window.createTerminal("Laravel Sail")
        await Server.terminal.sendText("./vendor/bin/sail up")
        Server.terminal.show()
    }


    public static async stop() {
        if (Server.terminal) {
            Server.terminal.dispose()
        }
        Server.terminal = window.createTerminal("Laravel Sail")
        Server.terminal.show()

        Server.terminal.sendText("./vendor/bin/sail down")
    }
}