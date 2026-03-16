// NoteRenderer for rendering UI
import { API_ENDPOINTS_NOTES } from "../utils/apiConfig.js";
import { ApiClient } from "../utils/apiClient.js";
import { Note } from "./Task.js";

export class NoteRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(
                `NoteRenderer: container with id '${containerId}' not found`,
            );
        }
        this.notes = [];

        this.api = new ApiClient();

        this.formEl = null;
        this.titleInputEl = null;
        this.contentInputEl = null;
        this.listEl = null;
    }

    async init() {
        this.renderLayout();
        this.renderLoading();

        await this.fetchNotes();
        this.renderNotes();
    }

    renderNotes() {
        if (!this.listEl) return;

        if (!this.notes.length) {
            this.listEl.innerHTML = `<div class="u-muted u-text-sm">Belum ada catatan.</div>`;
            return;
        }

        this.listEl.innerHTML = "";
        this.notes.forEach((note) => {
            const noteElement = document.createElement("article");
            noteElement.className = "note-card";

            const createdAtText = note.createdAt
                ? new Date(note.createdAt).toLocaleString()
                : "-";

            noteElement.innerHTML = `
                <h3>${this.escapeHtml(note.title)}</h3>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
                <div class="note-date">${createdAtText}</div>
                <div class="note-actions">
                    <button data-action="edit" data-id="${note.id}" type="button">Edit</button>
                    <button data-action="delete" data-id="${note.id}" type="button">Hapus</button>
                </div>
            `;
            this.listEl.appendChild(noteElement);
        });
    }

    async fetchNotes() {
        try {
            const { data } = await this.api.get(API_ENDPOINTS_NOTES.GET_NOTES);

            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.notes)
                  ? data.notes
                  : Array.isArray(data?.data)
                    ? data.data
                    : [];

            this.notes = list.map((note) => Note.fromJSON(note));
        } catch (error) {
            console.error("Failed to fetch notes:", error);
            this.renderError(
                "Gagal mengambil data catatan. Pastikan backend berjalan di http://localhost:3000 dan endpoint /api/notes mengembalikan JSON array.",
            );
        }
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="note-page">
                <div class="note-layout">
                    <section class="note-form">
                        <h2>Catatan Baru</h2>
                        <form id="noteForm">
                            <input id="title" name="title" placeholder="Judul catatan..." required />
                            <textarea id="content" name="content" placeholder="Tulis isi catatan..." rows="4" required></textarea>
                            <button type="submit">Tambah Catatan</button>
                        </form>
                    </section>
                    <section class="note-list-wrapper">
                        <div class="note-list-header">
                            <h2>Daftar Catatan</h2>
                            <button type="button" id="refreshBtn">Refresh</button>
                        </div>
                        <div id="notesList" class="notes-list"></div>
                    </section>
                </div>
            </div>
        `;

        this.formEl = this.container.querySelector("#noteForm");
        this.titleInputEl = this.container.querySelector("#title");
        this.contentInputEl = this.container.querySelector("#content");
        this.listEl = this.container.querySelector("#notesList");

        this.formEl.addEventListener("submit", async (event) => {
            event.preventDefault();

            const title = this.titleInputEl.value.trim();
            const content = this.contentInputEl.value.trim();
            if (!title || !content) return;

            await this.addNote(title, content);
            this.titleInputEl.value = "";
            this.contentInputEl.value = "";
        });

        const refreshBtn = this.container.querySelector("#refreshBtn");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", async () => {
                this.renderLoading();
                await this.fetchNotes();
                this.renderNotes();
            });
        }

        this.listEl.addEventListener("click", async (event) => {
            const btn = event.target.closest("button[data-action]");
            if (!btn) return;

            const action = btn.dataset.action;
            const id = Number(btn.dataset.id);

            if (action === "edit") {
                await this.editNote(id);
            }
            if (action === "delete") {
                await this.deleteNote(id);
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

    async addNote(title, content) {
        const newNote = { title, content };
        try {
            const { data: savedNote } = await this.api.post(
                API_ENDPOINTS_NOTES.CREATE_NOTE,
                newNote,
            );
            this.notes.unshift(Note.fromJSON(savedNote));
            this.renderNotes();
        } catch (error) {
            console.error("Failed to add note:", error);
            this.renderError("Gagal menambah catatan.");
        }
    }

    async editNote(id) {
        const note = this.notes.find((n) => Number(n.id) === Number(id));
        if (!note) return;

        const newTitle = prompt("Edit judul:", note.title);
        const newContent = prompt("Edit isi:", note.content);
        if (newTitle && newContent) {
            try {
                const { data: updatedNote } = await this.api.put(
                    API_ENDPOINTS_NOTES.UPDATE_NOTE(id),
                    {
                        title: newTitle,
                        content: newContent,
                    },
                );
                Object.assign(note, Note.fromJSON(updatedNote));
                this.renderNotes();
            } catch (error) {
                console.error("Failed to edit note:", error);
                this.renderError("Gagal mengedit catatan.");
            }
        }
    }

    async deleteNote(id) {
        try {
            await this.api.delete(API_ENDPOINTS_NOTES.DELETE_NOTE(id));
            this.notes = this.notes.filter(
                (note) => Number(note.id) !== Number(id),
            );
            this.renderNotes();
        } catch (error) {
            console.error("Failed to delete note:", error);
            this.renderError("Gagal menghapus catatan.");
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
