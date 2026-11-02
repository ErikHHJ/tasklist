const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('tasklist.css',import.meta.url)}">

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.getElementById("tasklist")
            .appendChild(tasktable.content.cloneNode(true));

        this.tbody = this.shadowRoot.querySelector("tbody");
        this.statuses = [];
        this.changestatusCallback = null;
        this.deletetaskCallback = null;
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
        this.statuses = allstatuses;
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    addChangestatusCallback(callback) {
        this.changestatusCallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    addDeletetaskCallback(callback) {
        this.deletetaskCallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
        const row = taskrow.content.cloneNode(true).querySelector("tr");
        row.dataset.id = String(task.id);

        row.children[0].textContent = task.title;
        row.children[1].textContent = task.status;

        const select = row.querySelector("select");
        this.fillStatusOptions(select, task.status);
        select.addEventListener("change", () => {
            const newStatus = select.value;
            select.value = "0";
            if (newStatus === "0") {
                return;
            }
            const ok = window.confirm("Set '" + task.title + "' to " + newStatus + "?");
            if (ok && this.changestatusCallback !== null) {
                this.changestatusCallback(task.id, newStatus);
            }
        });

        const removeButton = row.querySelector("button");
        removeButton.addEventListener("click", () => {
            const ok = window.confirm("Delete task '" + task.title + "'?");
            if (ok && this.deletetaskCallback !== null) {
                this.deletetaskCallback(task.id);
            }
        });

        this.tbody.insertBefore(row, this.tbody.firstChild);
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        const row = this.findRow(task.id);
        if (row === null) {
            return;
        }
        row.children[1].textContent = task.status;
        this.fillStatusOptions(row.querySelector("select"), task.status);
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        const row = this.findRow(id);
        if (row !== null) {
            row.remove();
        }
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        return this.tbody.querySelectorAll("tr").length;
    }

    /**
     * @param {number} id
     * @returns {HTMLTableRowElement|null}
     */
    findRow(id) {
        const rows = this.tbody.querySelectorAll("tr");
        for (const row of rows) {
            if (row.dataset.id === String(id)) {
                return row;
            }
        }
        return null;
    }

    /**
     * @param {HTMLSelectElement} select
     * @param {string} currentStatus
     */
    fillStatusOptions(select, currentStatus) {
        while (select.options.length > 1) {
            select.remove(1);
        }
        for (const status of this.statuses) {
            if (status !== currentStatus) {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                select.appendChild(option);
            }
        }
        select.value = "0";
    }
}
customElements.define('group11-tasklist', TaskList);
