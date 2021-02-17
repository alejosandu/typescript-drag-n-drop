enum ProjectStatus{
    Active, Finished
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {

    }
}

type ProjectListener = (items: Project[]) => void

class ProjectState {
    private listeners: ProjectListener[] = []
    private projects: Project[] = []

    private static _instance: ProjectState

    private constructor() {}

    static get instance() {
        if(this._instance) return this._instance
        this._instance = new ProjectState()
        return this._instance
    }

    addProject(title: string, description: string, people: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.Active
        )
        this.projects.push(newProject)
        this.notifyListeners([...this.projects])
    }

    addListener = (fnListener: ProjectListener): void => {
        this.listeners.push(fnListener)
    }

    notifyListeners = (data: Project[]): void => {
        for (const listener of this.listeners) {
            listener(data)
        }
    }
}

const projectState = ProjectState.instance

class ProjectInput {

    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        this.templateElement = <HTMLTemplateElement>document.getElementById("project-input")!
        this.hostElement = <HTMLDivElement>document.getElementById("app")!

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = "user-input"

        this.titleInputElement = <HTMLInputElement>this.element.querySelector("#title")
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector("#description")
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector("#people")

        this.configure()


        this.attach()
    }

    private gatherUserInput = (): [string, string, number] | void => {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value
        if (
            enteredTitle.trim().length === 0
            ||
            enteredDescription.trim().length === 0
            ||
            enteredPeople.trim().length === 0
        ) {
            alert("try again")
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInputs = () => {
        this.element.reset()
    }

    private submitHandler = (event: Event) => {
        event.preventDefault()
        const userInput = this.gatherUserInput()
        if (Array.isArray(userInput)) {
            console.log(userInput);
            const [title, description, people] = userInput
            projectState.addProject(title,description,people)
            this.clearInputs()
        }
    }

    private configure = () => {
        this.element.addEventListener('submit', this.submitHandler)
    }

    private attach = () => {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

class ProjectList {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLElement
    assignedProjects: Project[] = []
    constructor(private type: 'active' | 'finished') {
        this.templateElement = <HTMLTemplateElement>document.getElementById("project-list")!
        this.hostElement = <HTMLDivElement>document.getElementById("app")!

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLElement
        this.element.id = `${this.type}-projects`

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter((p) => {
                if(type === "active") return p.status === ProjectStatus.Active
                return p.status === ProjectStatus.Finished
            })
            this.renderProjects(relevantProjects)
        })

        this.attach()
        this.renderContent()
    }

    private renderContent = () => {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + " PROJECTS"

    }

    private attach = () => {
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }

    renderProjects = (projects: Project[]) => {
        this.assignedProjects = projects
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = "";
        for (const project of projects) {
            const listItem = document.createElement("li")
            listItem.textContent = project.title
            listEl.appendChild(listItem)
        }
    }
}

const app = new ProjectInput()
const activeProjectList = new ProjectList("active")
const activeProjectList2 = new ProjectList("finished")