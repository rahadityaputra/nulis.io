// Initialize the TaskRenderer
import { TaskRenderer } from "./TaskRenderer.js";

const taskRenderer = new TaskRenderer("app");
window.taskRenderer = taskRenderer;

taskRenderer.init().catch((error) => {
    console.error("Failed to init TaskRenderer:", error);
    const app = document.getElementById("app");
    if (app) {
        app.textContent = `Init error: ${String(error?.message || error)}`;
    }
});
