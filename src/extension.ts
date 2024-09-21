import * as vscode from 'vscode';

function double2Hex(double: number): string {
	const buffer = new ArrayBuffer(8); // 8 bytes for a double precision float
	const view = new DataView(buffer);
	view.setFloat64(0, double, false); // big-endian
	let hex = '';
	for (let i = 0; i < 8; i++) {
	  const byte = view.getUint8(i);
	  hex += byte.toString(16).padStart(2, '0');
	}
	return hex;
}

function float2Hex(float: number): string | null {
	const buffer = new ArrayBuffer(4); // 4 bytes for a single precision float
	const view = new DataView(buffer);
	view.setFloat32(0, float, false); // big-endian

	let hex = '';
	for (let i = 0; i < 4; i++) {
	  const byte = view.getUint8(i);
	  hex += byte.toString(16).padStart(2, '0');
	}

	// check if within range and exactly representable. Not sure about this feature.
	const testNum = view.getFloat32(0, false);
	if (testNum !== float) {
		hex += ' (not exact)';
	}
	return hex;
  }


function hex4_to_nums(hex: string): [number, number, number] {
	const buffer = new ArrayBuffer(4);
	const view = new DataView(buffer);
	const num = parseInt(hex, 16);
	view.setUint32(0, num, false); // big-endian
	  
	const int32 = view.getInt32(0, false);
	const uint32 = view.getUint32(0, false);
	const float32 = view.getFloat32(0, false);
	return [int32, uint32, float32];
  }

  function hex8_to_nums(hex: string): [number, number, number] {
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	const num = BigInt(hex);
	view.setBigUint64(0, num, false); // big-endian
  
	  const int64 = Number(view.getBigInt64(0, false));
	  const uint64 = Number(view.getBigUint64(0, false));
	const float64 = view.getFloat64(0, false);
	return [int64, uint64, float64];
  }

export class HoverProvider implements vscode.HoverProvider {
	provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
	  
	  	const wordRange = document.getWordRangeAtPosition(position);
		if (!wordRange) { return null; }
  
	  	const word = document.getText(wordRange);
		if (word.includes(".")) {
			const num = parseFloat(word);
			if (isNaN(num)) { return null; }
			const float_hex = '0x' + float2Hex(num);
			const double_hex = '0x' + double2Hex(num);
			const hoverText = new vscode.MarkdownString(
				`**single**: \`${float_hex}\`\n\n` +
			 	`**double**: \`${double_hex}\`\n\n`);
				 return new vscode.Hover(hoverText);
		}
		if (word.startsWith("0x")) {
			if (word.length <= 10) {
				const [int32, uint32, float32] = hex4_to_nums(word);
				const hoverText = new vscode.MarkdownString(
					`**int32**: \`${int32}\`\n\n` +
					`**uint32**: \`${uint32}\`\n\n` +
					`**double**: \`${float32}\``);
				return new vscode.Hover(hoverText);
			}
			const [int64, uint64, double] = hex8_to_nums(word);
			const hoverText = new vscode.MarkdownString(
				`**int64**: \`${int64}\`\n\n` +
				`**uint64**: \`${uint64}\`\n\n` +
				`**double**: \`${double}\``);
			return new vscode.Hover(hoverText);
		}

		const num = parseInt(word, 10);
		if (isNaN(num)) { return null; }
		const binary = '0b' + num.toString(2);
		const hex = '0x' + num.toString(16);
		const hoverText = new vscode.MarkdownString(
			`**hex**: \`${hex}\`\n\n` +
			`**binary**: \`${binary}\``);
		return new vscode.Hover(hoverText);
	}
  }

export function activate(context: vscode.ExtensionContext) {
//   console.log("hi from num2hex extension");
  const hoverProvider = new HoverProvider();
  context.subscriptions.push(vscode.languages.registerHoverProvider('*', hoverProvider));
}

export function deactivate() {}