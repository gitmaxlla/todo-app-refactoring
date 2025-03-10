import { StorageManager } from "./storagemanager.js";

const formInputFields = document.querySelector("form input");
const formButtons = document.querySelector("form button");
const headerTitles = document.querySelector("header h1");
const darkModeThemeSwitchButton = document.querySelector(".dark-mode");
const lightModeThemeSwitchButton = document.querySelector(".light-mode");  

export class ThemeManager {
    #darkModeEnabled;

    constructor(themeProperty) {
        this.themeProperty = themeProperty;
        this.#darkModeEnabled = false;
    }

    applySavedTheme() {
        this.#loadSavedTheme();
        this.#applyCurrentTheme();
    }

    #loadSavedTheme() {
        this.#darkModeEnabled = StorageManager.loadObject(this.themeProperty, false) === "enabled";
    }

    #setClassPresent(element, classname, value) {
        value ? element.classList.add(classname) : element.classList.remove(classname);
    }

    #applyCurrentTheme() {
        const savedValue = this.#darkModeEnabled ? "enabled" : null;
    
        StorageManager.saveObjectAs(savedValue, "dark-light");
        
        const setThemeFor = [document.body, formInputFields, formButtons];
    
        setThemeFor.forEach((element) => {
            this.#setClassPresent(element, 'dark', this.#darkModeEnabled);
        })
    
        this.#setClassPresent(darkModeThemeSwitchButton, "display-none", this.#darkModeEnabled);
        this.#setClassPresent(lightModeThemeSwitchButton, "display-none", !this.#darkModeEnabled);
    
        const headerTitlesColor = !this.#darkModeEnabled ? "#05445e" : "white";
        headerTitles.style.color = headerTitlesColor;
        return savedValue;
    }

    toggleDarkMode() {
        this.setDarkMode(!this.#darkModeEnabled);
    }

    setDarkMode(value) {
        this.#darkModeEnabled = value;
        this.#applyCurrentTheme();
    }
}