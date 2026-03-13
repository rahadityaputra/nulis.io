// Task class for business logic
export class Task {
    constructor(id, title, content, createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }

    static fromJSON(json) {
        return new Task(json.id, json.judul, json.isi, json.tanggal_dibuat);
    }
}
