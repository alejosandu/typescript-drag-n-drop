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
class State {
    constructor() {
        this.listeners = [];
        this.addListener = (fnListener) => {
            this.listeners.push(fnListener);
        };
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
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
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.attach = (insertAtStart) => {
            this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
        };
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId)
            this.element.id = `${newElementId}-projects`;
        this.attach(insertAtStart);
    }
}
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.configure = () => {
            this.element.addEventListener('submit', this.submitHandler);
        };
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
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
    }
    renderContent() { }
}
class ProjectItem extends Component {
    constructor(hostId, project) {
        super('single-project', hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    get persons() {
        if (this.project.people == 1)
            return '1 person';
        return `${this.project.people} persons`;
    }
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
        this.element.addEventListener('dragend', this.dragEndHandler.bind(this));
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.persons + " assigned";
        this.element.querySelector("p").textContent = this.project.description;
    }
    dragStartHandler(event) {
        var _a;
        console.log(event);
        (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(event) {
        console.log(event);
    }
}
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.renderContent = () => {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector('ul').id = listId;
            this.element.querySelector('h2').textContent = this.type.toUpperCase() + " PROJECTS";
        };
        this.renderProjects = (projects) => {
            this.assignedProjects = projects;
            const listEl = document.getElementById(`${this.type}-projects-list`);
            listEl.innerHTML = "";
            for (const project of projects) {
                new ProjectItem(this.element.querySelector('ul').id, project);
            }
        };
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((p) => {
                if (type === "active")
                    return p.status === ProjectStatus.Active;
                return p.status === ProjectStatus.Finished;
            });
            this.renderProjects(relevantProjects);
        });
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        var _a;
        if (((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types[0]) === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul');
            listEl.classList.add('droppable');
        }
    }
    dropHangler(event) {
        var _a;
        console.log((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain'));
    }
    dragLeaveHandler(event) {
        console.log(event);
        const listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    }
    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
        this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
        this.element.addEventListener('drop', this.dropHangler.bind(this));
    }
}
const app = new ProjectInput();
const activeProjectList = new ProjectList("active");
const activeProjectList2 = new ProjectList("finished");
