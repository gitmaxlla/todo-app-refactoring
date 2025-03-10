export class SnackBarController {
  constructor(element) {
    this.bar = element; 
  }

  show(message) {
    this.bar.innerText = message;
    this.bar.className = "show";
    setTimeout(function () {
      snackbar.className = "";
    }, 3000);
  }
}
