import * as vscode from "vscode";
import * as path from "path";
import { ComponentUsageProvider } from "./ComponentUsageProvider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new ComponentUsageProvider();
  vscode.window.registerTreeDataProvider("componentUsage", provider);

  // Comando principal: verificar uso de componente
  const disposable = vscode.commands.registerCommand(
    "extension.checkComponentUsage",
    async () => {
      const componentName = await vscode.window.showInputBox({
        prompt:
          "Name of the component to be checked (e.g. MyComponent or app-header)",
      });

      if (!componentName) return;

      // Mostra "⏳ Waiting Loading..."
      provider.refresh("", [], true);

      const loadingStatus = vscode.window.setStatusBarMessage(
        "$(sync~spin) Component Finder: Searching component usage..."
      );

      const isPascalCase = /^[A-Z]/.test(componentName); // React/Vue
      const isKebabCase = /^[a-z]+(-[a-z0-9]+)+$/.test(componentName); // Angular

      const pattern = "**/*.{js,jsx,ts,tsx,html,vue}";
      const exclude = "**/{node_modules,.git,dist,out,build}/**";

      let files: vscode.Uri[] = [];

      try {
        let searchFolder: vscode.WorkspaceFolder | undefined;

        if (
          !Array.isArray(vscode.workspace.workspaceFolders) ||
          vscode.workspace.workspaceFolders.length === 0
        ) {
          vscode.window.showErrorMessage("No active workspaces found.");
          return;
        }

        if (vscode.workspace.workspaceFolders.length === 1) {
          searchFolder = vscode.workspace.workspaceFolders[0];
        } else {
          const selected = await vscode.window.showQuickPick(
            vscode.workspace.workspaceFolders.map((folder) => folder.name),
            {
              placeHolder:
                "Select the folder where you want to search for the component.",
            }
          );
          if (!selected) return;

          searchFolder = vscode.workspace.workspaceFolders.find(
            (folder) => folder.name === selected
          );
        }

        if (!searchFolder) {
          vscode.window.showErrorMessage("Nenhuma pasta válida selecionada.");
          return;
        }

        files = await vscode.workspace.findFiles(
          new vscode.RelativePattern(searchFolder, pattern),
          exclude
        );
      } catch (err) {
        vscode.window.showErrorMessage("Error retrieving files.");
      } finally {
        loadingStatus.dispose();
      }

      const fileMatches: { filePath: string; lines: number[] }[] = [];

      for (const fileUri of files) {
        try {
          const filePath = fileUri.fsPath;
          const contentBuffer = await vscode.workspace.fs.readFile(fileUri);
          const content = Buffer.from(contentBuffer).toString("utf8");
          const lines = content.split(/\r?\n/);

          let match = false;
          let usageRegex: RegExp;

          if (isPascalCase) {
            const reactOrVuePattern = new RegExp(
              `<${componentName}[\\s/>]|<${componentName}$`
            );
            const tsImportPattern = new RegExp(
              `import\\s+.*${componentName}.*from\\s+['"]`
            );
            match =
              reactOrVuePattern.test(content) || tsImportPattern.test(content);
            usageRegex = new RegExp(`<${componentName}[\\s/>]`, "g");
          } else if (isKebabCase) {
            const angularPattern = new RegExp(
              `selector:\\s*['"]${componentName}['"]`,
              "i"
            );
            match = angularPattern.test(content);
            usageRegex = new RegExp(`<${componentName}[\\s/>]`, "gi");
          } else {
            vscode.window.showWarningMessage(
              `⚠️ The name "${componentName}" does not follow the PascalCase or kebab-case standard.`
            );
            continue;
          }

          if (!match) continue;

          const matchingLines: number[] = [];

          lines.forEach((line, index) => {
            if (usageRegex.test(line)) {
              matchingLines.push(index + 1);
            }
          });

          if (matchingLines.length > 0) {
            fileMatches.push({ filePath, lines: matchingLines });
          }
        } catch (err) {
          console.error("Error reading file:", err);
        }
      }

      // Atualiza TreeView com resultados
      provider.refresh(componentName, fileMatches, false);

      if (fileMatches.length === 0) {
        vscode.window.showInformationMessage(
          `❌ The component "${componentName}" not found.`
        );
      }
    }
  );

  // Comando para limpar manualmente
  const clearTreeCommand = vscode.commands.registerCommand(
    "extension.clearComponentUsage",
    () => {
      // Não coloca em loading, apenas limpa
      provider.refresh("", [], false);

      vscode.window.setStatusBarMessage(
        "🧹 Component Finder: Tree cleared.",
        3000
      );
    }
  );

  context.subscriptions.push(disposable, clearTreeCommand);
}

export function deactivate() {}
