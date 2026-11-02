/**
 * TaskView custom element for group 11.
 * Loads tasks from the server with the Fetch API and uses
 * TaskList and TaskBox to show and update the view.
 */
import "../tasklist/tasklist.js";
import "../taskbox/taskbox.js";

const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css"
href="${new URL('taskview.css',import.meta.url)}">
<h1>Tasks</h1>
<div id="message"><p>Waiting for server data.</p></div>
<div id="newtask">
<button type="button" disabled>New task</button>
</div>
<!-- The task list -->
<GROUP11-TASKLIST></GROUP11-TASKLIST>
<!-- The Modal -->
<GROUP11-TASKBOX></GROUP11-TASKBOX>
`;

class TaskView extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.serviceurl = this.getAttribute("data-serviceurl");
        this.messageBox = this.shadowRoot.querySelector("#message");
        this.newtaskButton = this.shadowRoot.querySelector("#newtask button");
        this.tasklist = this.shadowRoot.querySelector("group11-tasklist");
        this.taskbox = this.shadowRoot.querySelector("group11-taskbox");
        this.started = false;

        this.newtaskButton.addEventListener("click", () => {
            this.taskbox.show();
        });

        this.taskbox.addNewtaskCallback((task) => {
            this.addTask(task);
        });

        this.tasklist.addChangestatusCallback((id, status) => {
            this.changeStatus(id, status);
        });

        this.tasklist.addDeletetaskCallback((id) => {
            this.deleteTask(id);
        });
    }

    /**
     * Starts loading statuses and tasks when the element is added to the page.
     */
    async connectedCallback() {
        if (this.started) {
            return;
        }
        this.started = true;
        this.serviceurl = this.getAttribute("data-serviceurl");
        const statusesOk = await this.loadStatuses();
        const tasksOk = await this.loadTasks();
        if (statusesOk && tasksOk) {
            this.newtaskButton.disabled = false;
        }
    }

    /**
     * GET api/allstatuses
     * @returns {Promise<boolean>}
     */
    async loadStatuses() {
        const data = await this.getJson("allstatuses");
        if (data !== null && data.responseStatus === true) {
            this.tasklist.setStatuseslist(data.allstatuses);
            this.taskbox.setStatuseslist(data.allstatuses);
            return true;
        }
        return false;
    }

    /**
     * GET api/tasklist
     * @returns {Promise<boolean>}
     */
    async loadTasks() {
        const data = await this.getJson("tasklist");
        if (data !== null && data.responseStatus === true) {
            for (const task of data.tasks) {
                this.tasklist.showTask(task);
            }
            this.updateMessage();
            return true;
        }
        this.setMessage("Could not load tasks from the server.");
        return false;
    }

    /**
     * POST api/task
     * @param {{title:string, status:string}} task New task from TaskBox
     */
    async addTask(task) {
        const data = await this.sendJson("task", "POST", {
            title: task.title,
            status: task.status
        });
        if (data !== null && data.responseStatus === true) {
            this.tasklist.showTask(data.task);
            this.updateMessage();
            this.taskbox.close();
        }
    }

    /**
     * PUT api/task/{id}
     * @param {number} id
     * @param {string} status
     */
    async changeStatus(id, status) {
        const data = await this.sendJson("task/" + id, "PUT", {
            status: status
        });
        if (data !== null && data.responseStatus === true) {
            this.tasklist.updateTask({
                id: data.id,
                status: data.status
            });
        }
    }

    /**
     * DELETE api/task/{id}
     * @param {number} id Task id
     */
    async deleteTask(id) {
        const data = await this.getJson("task/" + id, "DELETE");
        if (data !== null && data.responseStatus === true) {
            this.tasklist.removeTask(data.id);
            this.updateMessage();
        }
    }

    /**
     * Updates the message under the heading.
     */
    updateMessage() {
        const count = this.tasklist.getNumtasks();
        if (count === 0) {
            this.setMessage("No tasks were found.");
        } else if (count === 1) {
            this.setMessage("Found 1 task.");
        } else {
            this.setMessage("Found " + count + " tasks.");
        }
    }

    /**
     * @param {string} text
     */
    setMessage(text) {
        const paragraph = this.messageBox.querySelector("p");
        paragraph.textContent = text;
    }

    /**
     * GET or DELETE request that returns JSON.
     * @param {string} path Path after the service URL
     * @param {string} [method="GET"]
     * @returns {Promise<object|null>}
     */
    async getJson(path, method) {
        try {
            const options = {};
            if (method) {
                options.method = method;
            }
            const response = await fetch(this.serviceurl + "/" + path, options);
            return await response.json();
        } catch (error) {
            this.setMessage("Could not contact the server.");
            return null;
        }
    }

    /**
     * POST or PUT request with a JSON body.
     * @param {string} path Path after the service URL
     * @param {string} method HTTP method
     * @param {object} body Object that will be sent as JSON
     * @returns {Promise<object|null>}
     */
    async sendJson(path, method, body) {
        try {
            const response = await fetch(this.serviceurl + "/" + path, {
                method: method,
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            this.setMessage("Could not contact the server.");
            return null;
        }
    }
}

customElements.define("group11-taskview", TaskView);
