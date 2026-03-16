import { NoteRenderer } from "./NoteRenderer.js";

const noteRenderer = new NoteRenderer("app");
window.noteRenderer = noteRenderer;

noteRenderer.init().catch((error) => {
    console.error("Failed to init NoteRenderer:", error);
    const app = document.getElementById("app");
    if (app) {
        app.textContent = `Init error: ${String(error?.message || error)}`;
    }
});
