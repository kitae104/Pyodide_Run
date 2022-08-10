export default class WasmTerminalConfig {
  constructor({ fetchCommand, processWorkerUrl, }) {
      this.fetchCommand = fetchCommand;
      this.processWorkerUrl = processWorkerUrl;
  }
}
