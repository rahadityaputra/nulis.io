// Updated API Configuration
export const API_ENDPOINTS = {
    GET_TASKS: "http://localhost:3000/api/tasks",
    ADD_TASK: "http://localhost:3000/api/tasks",
    EDIT_TASK: (id) => `http://localhost:3000/api/tasks/${id}`,
    DELETE_TASK: (id) => `http://localhost:3000/api/tasks/${id}`,
};
