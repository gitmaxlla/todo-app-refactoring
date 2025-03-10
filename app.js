import { SnackBarController } from "./snackbarcontroller.js";
import { Geolocator } from "./geolocator.js"
import { StorageManager } from "./storagemanager.js"
import { ProgressBar } from "./progressbar.js";
import { TimeDateUtils } from "./timedateutils.js";
import { ThemeManager } from "./thememanager.js";
import { Weather } from "./weather.js";

const snackBar = new SnackBarController(document.getElementById("snackbar"));
const progressBar = new ProgressBar(document.querySelector(".bar"));
const themeManager = new ThemeManager("dark-light");

const todoList = document.querySelector("#todo-container");
const inputField = document.querySelector("#input");
const addButton = document.querySelector(".add");

const allDoneButton = document.querySelector("#all-done");
const allUndoneButton = document.querySelector("#all-undone");
const clearButton = document.querySelector("#clear");

const themeSwitchButton = document.querySelector(".dark-light");
const currentTimeText = document.querySelector(".currentTime");

document.addEventListener("DOMContentLoaded", () => main())
function main() {
  setEventListeners();
  startTimeTextUpdater();
  getWeatherData();
  renderTodos();
  themeManager.applySavedTheme();
}

function startTimeTextUpdater() {
  setInterval(() => {
    currentTimeText.innerHTML = TimeDateUtils.currentTimeFormatted();
  }, 1000);
}

function getWeatherData() {
  Geolocator.getCurrentPosition(locationFound, locationNotFound);
}

function locationFound(pos) {
  Weather.fetchAt(pos.latitude, pos.longitude).then((data) => {
    displayWeatherInformation(data);
  });
}

function locationNotFound(err) {
  console.warn("ERROR(" + err.code + "): " + err.message);
}

function setEventListeners() {
  allDoneButton.addEventListener("click", () => {setAllCompletions(true);});
  allUndoneButton.addEventListener("click", () => {setAllCompletions(false);});
  clearButton.addEventListener("click", clearStorage);
  
  addButton.addEventListener("click", addTodo);

  todoList.addEventListener("click", clickedOnTodos);

  themeSwitchButton.addEventListener("click", () => {themeManager.toggleDarkMode();});
}

function displayWeatherInformation(data) {
  const currentDesc = document.querySelector(".currentDesc");
  const currentWeather = document.querySelector(".currentWeather");
  const currentLocation = document.querySelector(".currentLocation");

  currentWeather.style.color = data.temperature > 0 ? "#d19a66" : "#61aeee";
  currentWeather.style.fontSize = "3rem";

  currentWeather.innerHTML = data.temperature.toFixed(1) + "&deg;";
  currentDesc.innerHTML = data.description;
  currentLocation.innerHTML = data.name;

  if (TimeDateUtils.nightTimeNow(data.sunsetUNIXTime, data.sunriseUNIXTime)) {
    themeManager.setDarkMode(true);
  }
}

function renderTodos() {
  // this is inefficient but there's not an easy way to keep localStorage and the DOM in sync
  // without a framework
  clearTodoListDOM();

  let checkedItems = 0;
  let progressPercentage = 0;

  const todos = StorageManager.loadObject("todos");

  if (todos) {
    todos.forEach(todo => {
      todo.completed ? checkedItems++ : null;
      createTodoItem(todo)
    });

    progressPercentage = (checkedItems / todos.length) * 100;
  }

  progressBar.setProgress(progressPercentage);
}

function appendToSavedTodos(text) {
  let todos = [];

  if (StorageManager.objectSaved("todos")) {
    todos = StorageManager.loadObject("todos");
  }

  if (todoIsPresent(todos, text)) return;

  const newTodo = {
    text,
    completed: false,
    date: TimeDateUtils.currentTimeFormatted(),
  };

  const updatedTodosList = [...todos, newTodo];
  saveTodos(updatedTodosList);
}

function clickedOnTodos(e) {
  const todos = StorageManager.loadObject("todos");
  let actionPerformed = false;

  if (clickedOnClass(e, "trash")) {
    deleteButton(e.target, todos);
    actionPerformed = true;
  } else if (clickedOnClass(e, "completed")) {
    checkButton(e.target, todos);
    actionPerformed = true;
  } else if (clickedOnClass(e, "edited")) {
    editButton(e.target, todos);
    actionPerformed = true;
  }

  actionPerformed ? renderTodos() : null;
}

function addTodo(e) {
  //prevent form from submitting
  e.preventDefault();
  if (inputField.value) {
    appendToSavedTodos(inputField.value);
    inputField.value = "";
    renderTodos();
  }
}

function deleteButton(clickedButton, todos) {
  const index = indexOfTodo(todos, getTodoText(clickedButton));

  if (index > -1) {
    deleteElementAt(index, todos);
    snackBar.show("Deleted Todo Successfully..");
  }

  saveTodos(todos);
}

function checkButton(clickedButton, todos) {
    const index = indexOfTodo(todos, getTodoText(clickedButton));

    todos[index].completed = !todos[index].completed;

    saveTodos(todos);
}

function editButton(clickedButton, todos) {
    let text = prompt("Please enter your new description of todolist","");

    if(text != null && text != "") {
      const index = indexOfTodo(todos, getTodoText(clickedButton));

      if (index > -1) {
        deleteElementAt(index, todos);

        let dateTime = clickedButton.parentElement.parentElement.parentElement.innerText;
        const updatedTodo = {text: text, completed: false, date: dateTime.slice(0, 19)};
        replaceElementAt(index, todos, updatedTodo);

        snackBar.show("Todo List Updated Successfully...");
      }

      saveTodos(todos);
    }
}

function setAllCompletions(value) {
  let actionConfirmed = false;

  if (value && confirm("Do you really want to set all-done?") || !value && confirm("Do you really want to undone all TodoList?")) {
    actionConfirmed = true;
  } else { return; }

  const todos = StorageManager.loadObject("todos");

  if (actionConfirmed) {
    todos.map((todo) => {
      if (value && !todo.completed) {
        todo.completed = true;
      } else if (!value && todo.completed) {
        todo.completed = false;
      }
    })

    saveTodos(todos);
  }
}

function clearStorage() {
  if (confirm("Do you really want to clear?")) {
    StorageManager.deleteObject("todos");
  }
}

function createTodoButton(iconclass, mainclass) {
  const button = document.createElement("button");
  button.innerHTML = `<i class="fa ${iconclass}"></i>`;
  button.classList.add(mainclass);
  return button
}

function createTodoItem(todo) {
  const todosContainer = document.getElementById("todo-container");
  
  const todoItem = document.createElement("li");
  todoItem.classList.add("task-item");

  const todoItemInner = document.createElement("div");
  todoItemInner.classList.add("task-inner");
  crossIfCompleted(todoItemInner, todo);

  const todoButtonsContainer = document.createElement("div");
  todoButtonsContainer.classList.add("buttons");

  const todoText = document.createElement("div");
  todoText.classList.add("task-text");
  todoText.innerText = todo.text;

  todoButtonsContainer.appendChild(createTodoButton("fa-check", "completed"));
  todoButtonsContainer.appendChild(createTodoButton("fa-pencil-alt", "edited"));
  todoButtonsContainer.appendChild(createTodoButton("fa-trash", "trash"));

  let todoDate = document.createElement("div");
  todoDate.setAttribute("class", "task-date");
  todoDate.textContent = todo.date;
  crossIfCompleted(todoDate, todo);

  todoItem.appendChild(todoDate);
  todoItem.append(todoItemInner);

  todoItemInner.appendChild(todoText);
  todoItemInner.appendChild(todoButtonsContainer);

  todosContainer.appendChild(todoItem);
}

function saveTodos(todos) {  
  StorageManager.saveObjectAs(todos, "todos");
}

function clickedOnClass(e, classname) {
  return e.target.classList.contains(classname);
}

function todoIsPresent(todos, text) {
  return (todos.map((todo) => todo.text).includes(text));
}

function getTodoText(buttonElement) {
  return buttonElement.parentElement.parentElement.innerText;
}

function indexOfTodo(todos, text) {
    return todos.findIndex((todo) => {return todo.text === text});
}

function deleteElementAt(index, arr) {
  arr.splice(index, 1);
}

function replaceElementAt(index, arr, value) {
  arr.splice(index, 0, value);
}

function crossIfCompleted(element, todo) {
  if (todo.completed) element.classList.add("taskCompleted");
}

function clearTodoListDOM() {
  todoList.innerHTML = "";
}
