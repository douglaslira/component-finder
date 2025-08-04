import * as vscode from "vscode";
import * as path from "path";

export class LineUsageItem extends vscode.TreeItem {
  constructor(line: number, filePath: string) {
    super(`Linha ${line}`, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "vscode.open",
      title: "Abrir Linha",
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
    public readonly label: string,
    public readonly lines: number[],
    public readonly filePath: string
  ) {
    super(
      `${label} (${lines.length} uso${lines.length > 1 ? "s" : ""})`,
      vscode.TreeItemCollapsibleState.Collapsed
    );
    this.resourceUri = vscode.Uri.file(filePath);
    this.iconPath = vscode.ThemeIcon.File;
  }
}

export class ComponentUsageProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private componentName: string = "";
  private usageMap: { filePath: string; lines: number[] }[] = [];

  refresh(
    component: string,
    fileMatches: { filePath: string; lines: number[] }[]
  ) {
    this.componentName = component;
    this.usageMap = fileMatches;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: vscode.TreeItem
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
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
