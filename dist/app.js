"use strict";
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class ProjectState {
    constructor() {
        this.listeners = [];
        this.projects = [];
        this.addListener = (fnListener) => {
            this.listeners.push(fnListener);
        };
        this.notifyListeners = (data) => {
            for (const listener of this.listeners) {
                listener(data);
            }
        };
    }
    static get instance() {
        if (this._instance)
            return this._instance;
        this._instance = new ProjectState();
        return this._instance;
    }
    addProject(title, description, people) {
        const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active);
        this.projects.push(newProject);
        this.notifyListeners([...this.projects]);
    }
}
const projectState = ProjectState.instance;
class ProjectInput {
    constructor() {
        this.gatherUserInput = () => {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInputElement.value;
            if (enteredTitle.trim().length === 0
                ||
                    enteredDescription.trim().length === 0
                ||
                    enteredPeople.trim().length === 0) {
                alert("try again");
            }
            else {
                return [enteredTitle, enteredDescription, +enteredPeople];
            }
        };
        this.clearInputs = () => {
            this.element.reset();
        };
        this.submitHandler = (event) => {
            event.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                console.log(userInput);
                const [title, description, people] = userInput;
                projectState.addProject(title, description, people);
                this.clearInputs();
            }
        };
        this.configure = () => {
            this.element.addEventListener('submit', this.submitHandler);
        };
        this.attach = () => {
            this.hostElement.insertAdjacentElement('afterbegin', this.element);
        };
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = "user-input";
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
        this.attach();
    }
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.assignedProjects = [];
        this.renderContent = () => {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector('ul').id = listId;
            this.element.querySelector('h2').textContent = this.type.toUpperCase() + " PROJECTS";
        };
        this.attach = () => {
            this.hostElement.insertAdjacentElement('beforeend', this.element);
        };
        this.renderProjects = (projects) => {
            this.assignedProjects = projects;
            const listEl = document.getElementById(`${this.type}-projects-list`);
            listEl.innerHTML = "";
            for (const project of projects) {
                const listItem = document.createElement("li");
                listItem.textContent = project.title;
                listEl.appendChild(listItem);
            }
        };
        this.templateElement = document.getElementById("project-list");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((p) => {
                if (type === "active")
                    return p.status === ProjectStatus.Active;
                return p.status === ProjectStatus.Finished;
            });
            this.renderProjects(relevantProjects);
        });
        this.attach();
        this.renderContent();
    }
}
const app = new ProjectInput();
const activeProjectList = new ProjectList("active");
const activeProjectList2 = new ProjectList("finished");
