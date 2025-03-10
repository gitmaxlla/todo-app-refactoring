export class ProgressBar {
    constructor(element) {
        this.bar = element;
    }

    setProgress(percentage) {
        this.bar.style.width = percentage + "%";
        console.log(this.bar.style.width);
        this.bar.innerHTML = percentage.toFixed(1) + "%";
    }
}