// TaskRenderer for rendering UI
import { Task } from "./Task.js";
import { API_ENDPOINTS } from "../utils/apiConfig.js";
import { ApiClient } from "../utils/apiClient.js";

export class TaskRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(
                `TaskRenderer: container with id '${containerId}' not found`,
            );
        }
        this.tasks = [];

        this.api = new ApiClient();

        this.formEl = null;
        this.titleInputEl = null;
        this.contentInputEl = null;
        this.listEl = null;
    }

    async init() {
        this.renderLayout();
        this.renderLoading();

        await this.fetchTasks();
        this.renderTasks();
    }

    async fetchTasks() {
        try {
            const { data } = await this.api.get(API_ENDPOINTS.GET_TASKS);

            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.tasks)
                  ? data.tasks
                  : Array.isArray(data?.data)
                    ? data.data
                    : [];

            this.tasks = list.map((task) => Task.fromJSON(task));
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            this.renderError(
                "Gagal mengambil data task. Pastikan backend berjalan di http://localhost:3000 dan endpoint /api/tasks mengembalikan JSON array.",
            );
        }
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="u-flex u-flex-col u-gap-16">
                <header class="glass u-flex u-between u-items-center u-p-16">
                    <div>
                        <div class="u-text-xl u-font-700">NULIS.IO</div>
                        <div class="u-muted u-text-sm">Catatan / Task</div>
                    </div>
                    <div class="u-chip">Glass UI</div>
                </header>

                <section class="glass u-p-16">
                    <form id="taskForm" class="u-flex u-flex-col u-gap-12">
                        <div class="u-flex u-flex-col u-gap-8">
                            <label class="u-text-sm u-font-600" for="judul">Judul</label>
                            <input id="judul" name="judul" class="u-input" placeholder="Judul catatan..." required />
                        </div>
                        <div class="u-flex u-flex-col u-gap-8">
                            <label class="u-text-sm u-font-600" for="isi">Isi</label>
                            <textarea id="isi" name="isi" class="u-input u-textarea" placeholder="Tulis isi catatan..." rows="4" required></textarea>
                        </div>
                        <div class="u-flex u-gap-8 u-items-center">
                            <button class="u-btn u-btn-primary" type="submit">Tambah</button>
                            <span class="u-muted u-text-sm" id="statusText"></span>
                        </div>
                    </form>
                </section>

                <section class="glass u-p-16">
                    <div class="u-flex u-between u-items-center u-mb-12">
                        <div class="u-font-700">Daftar Catatan</div>
                        <button class="u-btn" type="button" id="refreshBtn">Refresh</button>
                    </div>
                    <div id="taskList" class="u-flex u-flex-col u-gap-12"></div>
                </section>
            </div>
        `;

        this.formEl = this.container.querySelector("#taskForm");
        this.titleInputEl = this.container.querySelector("#judul");
        this.contentInputEl = this.container.querySelector("#isi");
        this.listEl = this.container.querySelector("#taskList");

        this.formEl.addEventListener("submit", async (event) => {
            event.preventDefault();

            const title = this.titleInputEl.value.trim();
            const content = this.contentInputEl.value.trim();
            if (!title || !content) return;

            await this.addTask(title, content);
            this.titleInputEl.value = "";
            this.contentInputEl.value = "";
        });

        this.container
            .querySelector("#refreshBtn")
            .addEventListener("click", async () => {
                this.renderLoading();
                await this.fetchTasks();
                this.renderTasks();
            });

        this.listEl.addEventListener("click", async (event) => {
            const btn = event.target.closest("button[data-action]");
            if (!btn) return;

            const action = btn.dataset.action;
            const id = Number(btn.dataset.id);

            if (action === "edit") {
                await this.editTask(id);
            }
            if (action === "delete") {
                await this.deleteTask(id);
            }
        });
    }

    renderLoading() {
        if (!this.listEl) return;
        this.listEl.innerHTML = `<div class="u-muted u-text-sm">Loading...</div>`;
    }

    renderError(message) {
        if (!this.listEl) return;
        this.listEl.innerHTML = `<div class="u-error u-text-sm">${message}</div>`;
    }

    renderTasks() {
        if (!this.listEl) return;

        if (!this.tasks.length) {
            this.listEl.innerHTML = `<div class="u-muted u-text-sm">Belum ada catatan.</div>`;
            return;
        }

        this.listEl.innerHTML = "";
        this.tasks.forEach((task) => {
            const taskElement = document.createElement("article");
            taskElement.className = "glass u-p-16";

            const createdAtText = task.createdAt
                ? new Date(task.createdAt).toLocaleString()
                : "-";

            taskElement.innerHTML = `
                <div class="u-flex u-between u-items-center u-gap-12">
                    <div class="u-font-700">${this.escapeHtml(task.title)}</div>
                    <div class="u-flex u-gap-8">
                        <button class="u-btn" data-action="edit" data-id="${task.id}" type="button">Edit</button>
                        <button class="u-btn u-btn-danger" data-action="delete" data-id="${task.id}" type="button">Hapus</button>
                    </div>
                </div>
                <div class="u-mt-8">${this.escapeHtml(task.content)}</div>
                <div class="u-muted u-text-sm u-mt-12">Dibuat: ${createdAtText}</div>
            `;

            this.listEl.appendChild(taskElement);
        });
    }

    async addTask(title, content) {
        const newTask = { judul: title, isi: content };
        try {
            const { data: savedTask } = await this.api.post(
                API_ENDPOINTS.ADD_TASK,
                newTask,
            );
            this.tasks.unshift(Task.fromJSON(savedTask));
            this.renderTasks();
        } catch (error) {
            console.error("Failed to add task:", error);
            this.renderError("Gagal menambah task.");
        }
    }

    async editTask(id) {
        const task = this.tasks.find((t) => Number(t.id) === Number(id));
        if (!task) return;

        const newTitle = prompt("Edit title:", task.title);
        const newContent = prompt("Edit content:", task.content);
        if (newTitle && newContent) {
            try {
                const { data: updatedTask } = await this.api.put(
                    API_ENDPOINTS.EDIT_TASK(id),
                    {
                        judul: newTitle,
                        isi: newContent,
                    },
                );
                Object.assign(task, Task.fromJSON(updatedTask));
                this.renderTasks();
            } catch (error) {
                console.error("Failed to edit task:", error);
                this.renderError("Gagal mengedit task.");
            }
        }
    }

    async deleteTask(id) {
        try {
            await this.api.delete(API_ENDPOINTS.DELETE_TASK(id));
            this.tasks = this.tasks.filter(
                (task) => Number(task.id) !== Number(id),
            );
            this.renderTasks();
        } catch (error) {
            console.error("Failed to delete task:", error);
            this.renderError("Gagal menghapus task.");
        }
    }

    escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
