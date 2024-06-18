
import * as vscode from 'vscode';
import { ChatGptPanel } from './panels/main-view-panel';
import { SideBarViewProvider } from './panels/side-bar-view-panel';
import { getStoreData } from './utilities/utility.service';
import { registerCommand } from './utilities/context-menu-command';
import { ImagePanel } from './panels/image-view-panel';
import { FeedbackPanel } from './panels/feedback-view-panel';
import { matchSearchPhrase } from './utilities/matchSearchPhrase';
import { autoSuggestionSearch } from './utilities/autoSuggestionSearch';

export async function activate(context: vscode.ExtensionContext) {

	// Chat panel register
	const chatPanelCommand = vscode.commands.registerCommand("vscode-code-assistant.start", () => {
		ChatGptPanel.render(context);
	});
	context.subscriptions.push(chatPanelCommand);

	// Image panel register
	const imagePanelCommand = vscode.commands.registerCommand("vscode-code-assistant.start-image", () => {
		ImagePanel.render(context);
	});
	context.subscriptions.push(imagePanelCommand);

	// Image panel register
	const feedbackPanelCommand = vscode.commands.registerCommand("vscode-code-assistant.give-feedback", () => {
		FeedbackPanel.render(context);
	});
	context.subscriptions.push(feedbackPanelCommand);

	// Side Bar View Provider
	const provider = new SideBarViewProvider(context.extensionUri, context);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(SideBarViewProvider.viewType, provider));

	// const storeData = getStoreData(context);
	// registerCommand(storeData.apiKey);


	const autoSuggestionProvider: vscode.CompletionItemProvider = {
		// @ts-ignore
		provideInlineCompletionItems: async (document, position, context, token) => {
			// provideCompletionItems: async (document, position, context, token) => {
			const textBeforeCursor = document.getText(
				new vscode.Range(position.with(undefined, 0), position)
			);

			const match = matchSearchPhrase(textBeforeCursor);
			let items: any[] = [];

			if (match) {
				let rs: any = [];
				try {
					rs = await autoSuggestionSearch(match.searchPhrase);
					if (rs) {
						items = rs.map((item: any) => {
							console.log(item);
							const output = `\n${match.commentSyntax} Source: ${item.sourceURL} ${match.commentSyntaxEnd}\n${item.code}`;
							return {
								text: output,
								insertText: output,
								range: new vscode.Range(
									position.translate(0, output.length),
									position
								),
							};
						});
					}
				} catch (err: any) {
					vscode.window.showErrorMessage(err.toString());
				}
			}
			return { items };
		},
	};

	// @ts-ignore
	vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, autoSuggestionProvider);

}

export function deactivate() { }

const startChars = ["<!--", "#", "//", "/*"];
const keywords = ["find", "generate"];
const triggerKeywords = startChars.map(s => keywords.map(k => [`${s} ${k}`, `${s}${k}`])).flat(2);