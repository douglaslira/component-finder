import * as vscode from "vscode";
import * as path from "path";

export class LineUsageItem extends vscode.TreeItem {
  constructor(line: number, filePath: string) {
    super(`Line ${line}`, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "vscode.open",
      title: "Open file at line",
      arguments: [
        vscode.Uri.file(filePath),
        { selection: new vscode.Range(line - 1, 0, line - 1, 0) },
      ],
    };
    this.iconPath = new vscode.ThemeIcon("arrow-right");
  }
}

export class FileUsageItem extends vscode.TreeItem {
  constructor(
    fileName: string,
    public readonly lines: number[],
    public readonly filePath: string
  ) {
    const fullLabel = `${fileName} (${lines.length} use${
      lines.length > 1 ? "s" : ""
    })`;
    super(fullLabel, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new vscode.ThemeIcon("file");
    this.tooltip = `${lines.length} use${
      lines.length > 1 ? "s" : ""
    } in ${filePath}`;
  }
}

export class LoadingItem extends vscode.TreeItem {
  constructor() {
    super("⏳ Waiting Loading...", vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("sync~spin");
  }
}

export class EmptyItem extends vscode.TreeItem {
  constructor() {
    super("🗒️ No components to search", vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("info");
  }
}

export class ComponentUsageProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private usageMap: { filePath: string; lines: number[] }[] = [];
  private isLoading: boolean = false;

  refresh(
    component: string,
    fileMatches: { filePath: string; lines: number[] }[],
    loading = false
  ) {
    this.usageMap = fileMatches;
    this.isLoading = loading;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: vscode.TreeItem
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    if (this.isLoading) {
      return [new LoadingItem()];
    }

    if (!element) {
      if (this.usageMap.length === 0) {
        return [new EmptyItem()];
      }

      return this.usageMap.map(
        ({ filePath, lines }) =>
          new FileUsageItem(path.basename(filePath), lines, filePath)
      );
    }

    if (element instanceof FileUsageItem) {
      return element.lines.map(
        (line) => new LineUsageItem(line, element.filePath)
      );
    }

    return [];
  }
}
