# 🧩 Component Finder

![Component Finder Logo](./ico/icon_2.png)

**Component Finder** é uma extensão poderosa para o VS Code que permite localizar rapidamente onde e quantas vezes um determinado componente está sendo utilizado em projetos **React**, **Vue**, **Angular**, **TypeScript** ou **JavaScript**.

> 🔍 Ideal para desenvolvedores que trabalham em grandes bases de código e precisam entender a distribuição de uso de seus componentes.

---

## 🚀 Funcionalidades

- 🔍 **Busca rápida por nome de componente**
- 📄 **Lista todos os arquivos onde o componente é usado**
- 🧠 **Destaque das linhas exatas de uso**
- 🛠️ **Suporte para múltiplas linguagens e frameworks**
  - React (JSX/TSX)
  - Vue (Single File Components)
  - Angular (kebab-case selectors)
  - HTML puro
- 📁 **Suporte a workspaces com múltiplas pastas**
- 📌 **Case-sensitive para distinguir componentes de tags HTML nativas**

---

## 📸 Capturas de Tela

> _Veja a extensão em ação:_

![Preview da extensão](./screenshot.png)

---

## ⚙️ Como Usar

1. Pressione `Ctrl+Shift+P` ou `Cmd+Shift+P` para abrir o **Command Palette**.
2. Digite e selecione: `Component Finder: Verificar uso de componente`.
3. Digite o nome do componente (ex: `MyComponent` ou `app-header`).
4. O painel lateral mostrará os arquivos e as linhas onde o componente é utilizado.

> ✅ Não é necessário abrir um arquivo para usar o plugin!

---

## 🧠 Regras de Nomeação

- **PascalCase**: Para React e Vue (ex: `MyComponent`)
- **kebab-case**: Para Angular (ex: `app-header`)
- O plugin diferencia entre componentes personalizados e elementos HTML padrão como `<footer>`, `<header>`, etc.

---

## 📦 Instalação

Acesse a [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/) (em breve) e procure por **Component Finder**  
Ou instale diretamente via VS Code:

> ext install nyxgames.component-finder
