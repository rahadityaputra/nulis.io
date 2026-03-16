export class Note {
    constructor(id, title, content, createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }

    static fromJSON(json) {
        return new Note(json.id, json.title, json.content, json.createdAt);
    }
}
