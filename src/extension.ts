import * as vscode from 'vscode';


export class HoverProvider implements vscode.HoverProvider {
	provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
	  
	  const wordRange = document.getWordRangeAtPosition(position);
	  if (!wordRange) {
		return null;
	  }
  
	  const word = document.getText(wordRange);
	  const num = parseInt(word, 10);
	  if (isNaN(num)) {
		return null;
	  }
  
	  const binary = num.toString(2);
	  const hex = num.toString(16);
  
	  const hoverText = `Binary: ${binary}\nHex: ${hex}`;
	  return new vscode.Hover(hoverText);
	}
  }

export function activate(context: vscode.ExtensionContext) {
  console.log("hi from num2hex extension");
  const hoverProvider = new HoverProvider();
  context.subscriptions.push(vscode.languages.registerHoverProvider('*', hoverProvider));
}

export function deactivate() {}