import { App, Modal, Plugin, PluginSettingTab, Setting, MarkdownView } from 'obsidian';
import { DummySuggest } from 'src/MyEditorSuggest'

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

/////////////////
import { keymap, EditorView } from "@codemirror/view"

function dummyKeymap() {
  return keymap.of([{
    key: "ArrowUp",
    run() { console.log("Lol"); return false }
  }])
}

function dummyInput() {
  return EditorView.inputHandler.of((view, from, to, text) => {
    console.log("input!");
    return false;
  });
}
////////////////

import {Tooltip, showTooltip, tooltips} from "@codemirror/view"
import {StateField, Extension} from "@codemirror/state"

const cursorTooltipField = StateField.define<readonly Tooltip[]>({
  create: emptyTooltip,

  update(tooltips, tr) {
    if (!tr.docChanged && !tr.selection) return tooltips
    return getCursorTooltips(tr.state)
  },

  provide: f => showTooltip.computeN([f], state => state.field(f))
  
})

import {EditorState} from "@codemirror/state"

function emptyTooltip(state: EditorState): readonly Tooltip[] {
	return [{
			pos: 0,
			create: () => {
				let dom = document.createElement("div")
				return { dom: dom,
						offset: {x: -500, y: 0} }
			}
		}
	]
}

function getCursorTooltips(state: EditorState): readonly Tooltip[] {
  return state.selection.ranges
    .filter(range => range.empty)
    .map(range => {
      let line = state.doc.lineAt(range.head)
      let text = line.number + ":" + (range.head - line.from)
      return {
        pos: range.head,
        above: true,
        strictSide: false,
        arrow: true,
        create: () => {
          let dom = document.createElement("div")
          dom.className = "cm-tooltip-cursor"
          dom.textContent = text
          return {
			dom: dom,
			//offset: {x: -329, y: 25},
		  }
        }
      }
    })
}

const cursorTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    backgroundColor: "#66b",
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#66b"
    },
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "transparent"
    },
	"z-index": 300, // does not work 😓
  }
})

class CursorEventHandlers{
	alt_pressed: boolean;
	d_pressed: boolean;

	constructor() {
		this.alt_pressed = false;
		this.d_pressed = false;
	}

	provide_handler(): Extension {
		let self = this;
		let domHand = EditorView.domEventHandlers({
			keydown(event, view) {
				if (event.key.includes("Alt")) self.alt_pressed = true
				if (event.key == "d") self.d_pressed = true
			},
			keyup(event, view) {
				if (event.key.includes("Alt")) self.alt_pressed = false
				if (event.key == "d") self.d_pressed = false
			}
		});
		return domHand;
	}

	provide_state(): StateField<readonly Tooltip []> {
		let self = this;
		return StateField.define<readonly Tooltip[]>({
			create: emptyTooltip,

			update(tooltips, tr) {
				if (!self.d_pressed || !self.alt_pressed) 
					return emptyTooltip(tr.state)
				return getCursorTooltips(tr.state)
			},
			
			provide: f => showTooltip.computeN([f], state => state.field(f))
			
		  })
	}
	
}

/////////////////////

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	cursorEvent: CursorEventHandlers;

	async onload() {
		// await this.loadSettings();

		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// // This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		let tooltip_config = tooltips({position: "absolute"})

		this.cursorEvent = new CursorEventHandlers;

		this.registerEditorExtension([dummyKeymap(), cursorTooltipBaseTheme, tooltip_config, this.cursorEvent.provide_state(), 
			this.cursorEvent.provide_handler()]);

		this.registerEditorSuggest(new DummySuggest(app));
 
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
