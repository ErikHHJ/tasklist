/**
 * TaskBox custom element for group 11.
 * Modal dialog used to add a new task.
 * This component does not use Ajax.
 */
const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css"
href="${new URL('taskbox.css',import.meta.url)}">
<dialog>
<!-- Modal content -->
<span>&times;</span>
<div>
<div>Title:</div>
<div>
<input type="text" size="25" maxlength="80"
placeholder="Task title" autofocus/>
</div>
<div>Status:</div><div><select></select></div>
</div>
<p><button type="submit">Add task</button></p>
</dialog>
`;

class TaskBox extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.dialog = this.shadowRoot.querySelector("dialog");
        this.closeSpan = this.shadowRoot.querySelector("span");
        this.titleInput = this.shadowRoot.querySelector("input");
        this.statusSelect = this.shadowRoot.querySelector("select");
        this.addButton = this.shadowRoot.querySelector("button");
        this.newtaskCallback = null;

        this.closeSpan.addEventListener("click", () => {
            this.close();
        });

        this.addButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.onAddTask();
        });
    }

    /**
     * Opens the modal box.
     */
    show() {
        this.titleInput.value = "";
        this.dialog.showModal();
        this.titleInput.focus();
    }

    /**
     * Closes the modal box.
     */
    close() {
        this.dialog.close();
    }

    /**
     * Fills the status dropdown with the given list.
     * @param {string[]} list Status names from the server
     */
    setStatuseslist(list) {
        this.statusSelect.replaceChildren();
        for (const status of list) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            this.statusSelect.appendChild(option);
        }
    }

    /**
     * Sets the callback that runs when the user clicks Add task.
     * @param {function({title:string, status:string}):void} callback
     */
    addNewtaskCallback(callback) {
        this.newtaskCallback = callback;
    }

    /**
     * Reads the form and runs the callback with the new task.
     */
    onAddTask() {
        const title = this.titleInput.value.trim();
        const status = this.statusSelect.value;
        if (title === "" || this.newtaskCallback === null) {
            return;
        }
        this.newtaskCallback({
            title: title,
            status: status
        });
    }
}

customElements.define("group11-taskbox", TaskBox);
