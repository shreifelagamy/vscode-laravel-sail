import { ProgressLocation, ViewColumn, WebviewPanel, window, workspace } from "vscode";
import Common from "../../Common";

export default class Route extends Common {
    private static list: string = `route:list -v --json`
    private static timeout: NodeJS.Timer
    private static currentPanel: WebviewPanel | undefined = undefined;
    private static records: any
    private static intervalOn: boolean = false

    public static async run() {
        window.withProgress({
            cancellable: true,
            location: ProgressLocation.Notification,
            title: "Loading route list"
        }, (progress, token) => {
            const p = new Promise<void>(resolve => {
                this.execArtisanCmd(this.list, async (info) => {
                    if (info.err) {
                        return this.showError('The route list could not be generated', info.err)
                    } else {
                        this.parseJson(info.stdout)
                        await this.openVirtualHtmlFile('route-list', 'Route List')
                        this.ping();

                    }
                    resolve();
                })
            })

            return p;
        })

    }

    protected static parseJson(jsonData: string) {
        interface RouteObject {
            [key: string]: any
        }

        let records: [RouteObject] = JSON.parse(jsonData);
        let headers: string[] = Object.keys(records[0]);
        let rows: string[][] = [];

        records.forEach((value, index) => {
            let arr: string[] = [];
            Object.keys(value).forEach(key => {
                let val = value[key] !== null ? value[key] : '-'
                arr.push(val)
            })
            rows.push(arr);
        })

        this.records = { headers, rows };
    }

    private static get tableStyle(): string {
        return `<style>
          * { box-sizing: border-box; }
          body { padding: 0; margin: 0; }
          table { border-collapse: collapse; width: 95vw; margin: auto; }
          table thead { font-size: 16px; text-align: left; }
          table tbody { font-size: 14px; }
          table td, table th { padding: 10px; }
          table tbody tr:nth-child(odd) { background-color: rgba(0,0,0,0.25); }
          table td a { color: #4080d0; cursor: pointer; }
          .hidden { display: none; }
          .search { padding-top: 15px; padding-bottom: 15px; width: 95vw; margin: auto; }
          #filter { display: block; padding: 5px; width: 100%; }
          .reload-btn {
            cursor: pointer;
            color: #fff;
            background-color: #28a745;
            border-color: #28a745;
            display: inline-block;
            font-weight: 200;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            border: 1px solid transparent;
            border-top-color: transparent;
            border-right-color: transparent;
            border-bottom-color: transparent;
            border-left-color: transparent;
            padding: 0.375rem 0.75rem;
            font-size: 13px;
            line-height: 1.5;
            border-radius: 0.25rem;
          }
        </style>`
    }

    protected static async openVirtualHtmlFile(openPath: string, title: string) {
        const columnToShowIn = window.activeTextEditor
            ? window.activeTextEditor.viewColumn
            : undefined;

        if (this.currentPanel) {
            this.currentPanel.reveal(columnToShowIn)
        } else {
            this.currentPanel = window.createWebviewPanel(openPath, title, ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true
            })
            this.currentPanel.webview.html = this.getWebViewContent()
            this.currentPanel.webview.onDidReceiveMessage(async msg => { })
            this.currentPanel.onDidDispose(() => {
                console.log('disposaling');

                clearInterval(this.timeout)
                this.intervalOn = false;
                this.currentPanel = undefined
            })
        }

        return this.currentPanel
    }

    private static getWebViewContent(): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <title>Route List</title>

                ${this.tableStyle}
            </head>
            <body>
                <div class="search">
                    <input type="text" id="filter" placeholder="Search for an item (RegExp Supported)">
                </div>
                <table>
                    <thead>
                        ${this.drawHeaders}
                    </thead>
                    <tbody>
                        ${this.drawRows}
                    </tbody>
                </table>
                <script>
                    const filter = document.querySelector('#filter')
                    const body = document.querySelector('table tbody')
                    const rootPath = '${workspace.rootPath}'
                    const vscode = acquireVsCodeApi()
                    filter.focus()
                    function filterItems() {
                        let v = filter.value
                        document.querySelectorAll('tbody > tr').forEach(row => {
                            let txt = row.textContent
                            let reg = new RegExp(v, 'ig')
                            if (reg.test(txt) || v.length == 0) {
                                row.classList.remove('hidden')
                            } else {
                                row.classList.add('hidden')
                            }
                        })
                    }
                    function routeEvents(){
                        Array.from(body.querySelectorAll('a')).forEach(item => {
                            item.addEventListener('click', e => {
                                e.preventDefault()
                                let target = e.currentTarget
                                vscode.postMessage({ file: target.href, method: target.getAttribute('data-method') })
                            })
                        })
                    }
                    filter.addEventListener('input', filterItems)
                    window.addEventListener('message', msg => {
                        let rows = msg.data.rows
                        let html = ''
                        rows.forEach(row => {
                            html += '<tr>'
                            row.forEach(item => {
                            if (item.match(/app\\\\/i)) {
                                let file = \`\${rootPath}/\${item.replace(/@.+$/, '').replace(/^App/, 'app')}.php\`.replace(/\\\\/g, '/')
                                html += \`<td><a href="\${file}" data-method="\${item.replace(/^.+@/, '')}" class="app-item">\` + item + '</a></td>'
                            } else {
                                html += '<td>' + item + '</td>'
                            }
                            })
                            html += '</tr>'
                        })
                        body.innerHTML = html
                        filterItems()
                        routeEvents()
                    })
                    routeEvents()
                </script>
            </body>
        </html>
        `
    }

    private static get drawHeaders(): string {
        let headerRows: string = '<tr>';
        this.records.headers.forEach((header: string) => {
            headerRows += '<th>' + header + '</th>'
        })
        headerRows += '</tr>';

        return headerRows;
    }

    private static get drawRows(): string {
        let bodyRows: string = '';
        this.records.rows.forEach((row: string[]) => {
            bodyRows += '<tr>'
            row.forEach((item: string) => {
                bodyRows += '<td>' + item + '</td>'
            })
            bodyRows += '</tr>'
        })

        return bodyRows;
    }

    private static ping() {
        if (this.currentPanel !== undefined && this.intervalOn === false) {
            let running = false
            let { currentPanel, getWebViewContent, list } = this
            this.timeout = setInterval(() => {
                this.execArtisanCmd(list, async (info) => {
                    if (info.err) {
                        return this.showError('The route list could not be generated', info.err)
                    } else {
                        this.parseJson(info.stdout)

                        currentPanel.webview.html = this.getWebViewContent()
                    }
                })

                this.intervalOn = true
            }, 5000);
        }
    }
}