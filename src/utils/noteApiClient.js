import { API_ENDPOINTS_NOTES } from "./apiConfig.js";

export class NoteApiClient {
    constructor(baseHeaders = {}) {
        this.baseHeaders = baseHeaders;
    }

    async request(url, { method = "GET", headers = {}, body } = {}) {
        const response = await fetch(url, {
            method,
            headers: {
                Accept: "application/json",
                ...this.baseHeaders,
                ...headers,
            },
            body,
        });

        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        if (response.status === 204) {
            return { ok: response.ok, status: response.status, data: null };
        }

        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return { ok: response.ok, status: response.status, data };
    }

    get(url) {
        return this.request(url);
    }

    post(url, jsonBody) {
        console.log(jsonBody);
        return this.request(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonBody),
        });
    }

    put(url, jsonBody) {
        return this.request(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonBody),
        });
    }

    delete(url) {
        return this.request(url, { method: "DELETE" });
    }

    async getNotes() {
        return this.get(API_ENDPOINTS_NOTES.GET_NOTES);
    }

    async createNote(note) {
        return this.post(API_ENDPOINTS_NOTES.CREATE_NOTE, note);
    }

    async updateNote(note) {
        return this.put(API_ENDPOINTS_NOTES.UPDATE_NOTE(note.id), note);
    }

    async deleteNote(id) {
        return this.delete(API_ENDPOINTS_NOTES.DELETE_NOTE(id));
    }
}
