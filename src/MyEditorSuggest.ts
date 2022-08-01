import { App, Modal, EditorSuggest, Editor, EditorPosition, EditorSuggestTriggerInfo, TFile, EditorSuggestContext } from 'obsidian';

export class DummySuggest extends EditorSuggest<string> {
    private count = 0;
    limit = 4;

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
        let before: EditorPosition = {
            line: cursor.line,
            ch: cursor.ch-1
        }
        console.log("on trigger got " + editor.getRange(before, cursor) );
        if ( editor.getRange(before, cursor) == "@" )  {
            return {
                start: before,
                end: cursor,
                query: "yay"
            }
        }
        if ( editor.getRange(before, cursor) == "&" )  {
            return {
                start: before,
                end: cursor,
                query: "yoy"
            }
        }
        return null;
    }

    getSuggestions(context: EditorSuggestContext): string[] | Promise<string[]> {
        console.log("Get suggestions")
        if (context.query == "yay")
            return ["hello", "hi", "hola", "ciao"];
        else 
            return ["a", "b", "c", "d", "f", "e", "n", "f", "ja", "lol"];
    }

    selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
        console.log("Selected " + value);
    }

    renderSuggestion(value: string, el: HTMLElement): void {
        console.log("Render suggestions")
        const row = document.createElement('tr');
        const cell1 = row.createEl('td');
        const iconDiv = cell1.createDiv();
        iconDiv.classList.add('command-list-view-icon');
        iconDiv.setText(this.count.toString());
        this.count += 1;
        const cell2 = row.createEl('td');
        cell2.classList.add('command-list-view-text');
        cell2.setText(value);
        el.appendChild(row)
    }

}