export const API_ENDPOINTS_NOTES = {
    GET_NOTES: "http://localhost:3000/api/notes",
    CREATE_NOTE: "http://localhost:3000/api/notes",
    UPDATE_NOTE: (id) => `http://localhost:3000/api/notes/${id}`,
    DELETE_NOTE: (id) => `http://localhost:3000/api/notes/${id}`,
};
