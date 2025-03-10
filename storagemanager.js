export class StorageManager {
    static loadObject(name) {
        return JSON.parse(localStorage.getItem(name));
    }

    static saveObjectAs(obj, name) {
        localStorage.setItem(name, JSON.stringify(obj));
    }

    static objectSaved(name) {
        return localStorage.hasOwnProperty(name);
    }

    static deleteObject(name) {
        localStorage.removeItem(name);
    }

    static loadObjectIfSaved(name) {
        if (this.objectSaved(name)) {
            return this.loadObject(name);
        }

        return null;
    }
}