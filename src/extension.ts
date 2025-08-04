import * as vscode from "vscode";
import * as path from "path";
import { ComponentUsageProvider } from "./ComponentUsageProvider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new ComponentUsageProvider();
  vscode.window.registerTreeDataProvider("componentUsage", provider);

  const disposable = vscode.commands.registerCommand(
    "extension.checkComponentUsage",
    async () => {
      const componentName = await vscode.window.showInputBox({
        prompt:
          "Nome do componente a verificar (ex: MyComponent ou app-header)",
      });

      if (!componentName) return;

      const isPascalCase = /^[A-Z]/.test(componentName); // React/Vue
      const isKebabCase = /^[a-z]+(-[a-z0-9]+)+$/.test(componentName); // Angular (kebab-case)

      const pattern = "**/*.{js,jsx,ts,tsx,html,vue}";
      const exclude = "**/{node_modules,.git,dist,out,build}/**";

      let files: vscode.Uri[] = [];

      try {
        let searchFolder: vscode.WorkspaceFolder | undefined;

        if (
          !Array.isArray(vscode.workspace.workspaceFolders) ||
          vscode.workspace.workspaceFolders.length === 0
        ) {
          vscode.window.showErrorMessage("Nenhum workspace ativo encontrado.");
          return;
        }

        if (vscode.workspace.workspaceFolders.length === 1) {
          // Apenas uma pasta no workspace
          searchFolder = vscode.workspace.workspaceFolders[0];
        } else {
          // Várias pastas — pergunta ao usuário
          const selected = await vscode.window.showQuickPick(
            vscode.workspace.workspaceFolders.map((folder) => folder.name),
            {
              placeHolder: "Escolha a pasta onde deseja buscar o componente",
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
        vscode.window.showErrorMessage("Erro ao buscar arquivos.");
        return;
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
            // Case-sensitive para evitar tags nativas como <footer>
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
            // Case-insensitive para Angular
            const angularPattern = new RegExp(
              `selector:\\s*['"]${componentName}['"]`,
              "i"
            );
            match = angularPattern.test(content);
            usageRegex = new RegExp(`<${componentName}[\\s/>]`, "gi");
          } else {
            vscode.window.showWarningMessage(
              `⚠️ O nome "${componentName}" não segue padrão PascalCase ou kebab-case.`
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
          console.error("Erro ao ler arquivo:", err);
        }
      }

      if (fileMatches.length === 0) {
        vscode.window.showInformationMessage(
          `❌ O componente "${componentName}" não foi encontrado.`
        );
      } else {
        provider.refresh(componentName, fileMatches);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
