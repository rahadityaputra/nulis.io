export const BASE_URL = "https://be-rest-325409493725.us-central1.run.app/";

export const API_ENDPOINTS_NOTES = {
    GET_NOTES: `${BASE_URL}/api/notes`,
    CREATE_NOTE: `${BASE_URL}/api/notes`,
    UPDATE_NOTE: (id) => `${BASE_URL}/api/notes/${id}`,
    DELETE_NOTE: (id) => `${BASE_URL}/api/notes/${id}`,
};
