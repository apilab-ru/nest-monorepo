
export class Commands {
  private commandMap = {
    refreshRats: false
  };

  refreshRats() {
    this.commandMap.refreshRats = true;
  }

  getCommandRefreshRats(): boolean {
    if (this.commandMap.refreshRats) {
      this.commandMap.refreshRats = false;

      return true;
    }

    return false;
  }
}
