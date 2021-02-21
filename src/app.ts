
interface Draggable {
    dragStartHandler(event: DragEvent): void
    dragEndHandler(event: DragEvent): void
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void
    dropHangler(event: DragEvent): void
    dragLeaveHandler(event: DragEvent): void
}

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

type ProjectListener<T> = (items: T[]) => void

class State<T> {
    protected listeners: ProjectListener<T>[] = []
    constructor() {
        
    }

    addListener = (fnListener: ProjectListener<T>): void => {
        this.listeners.push(fnListener)
    }
}

class ProjectState extends State<Project>{
    private projects: Project[] = []

    private static _instance: ProjectState

    private constructor() {
        super();
    }

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

    notifyListeners = (data: Project[]): void => {
        for (const listener of this.listeners) {
            listener(data)
        }
    }
}

const projectState = ProjectState.instance

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string,
    ) {
        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!
        this.hostElement = <T>document.getElementById(hostElementId)!

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = <U>importedNode.firstElementChild
        if(newElementId) this.element.id = `${newElementId}-projects`
        this.attach(insertAtStart)
    }

    private attach = (insertAtStart: boolean) => {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element)
    }

    abstract configure(): void
    abstract renderContent(): void

}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        super("project-input", "app", true, "user-input")
        this.titleInputElement = <HTMLInputElement>this.element.querySelector("#title")
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector("#description")
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector("#people")
        this.configure()
    }

    configure = () => {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent() {}

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
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {

    private project: Project;

    get persons() {
        if(this.project.people == 1) return '1 person'
        return `${this.project.people} persons`
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id)
        this.project = project
        this.configure()
        this.renderContent()
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this))
        this.element.addEventListener('dragend', this.dragEndHandler.bind(this))
    }

    renderContent() {
        this.element.querySelector("h2")!.textContent = this.project.title
        this.element.querySelector("h3")!.textContent = this.persons + " assigned";
        this.element.querySelector("p")!.textContent = this.project.description;
    }

    dragStartHandler(event: DragEvent) {
        console.log(event);
    }

    dragEndHandler(event: DragEvent) {
        console.log(event);
    }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[] = []
    constructor(private type: 'active' | 'finished') {
        super("project-list", "app", false, `${type}-projects`)

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter((p) => {
                if(type === "active") return p.status === ProjectStatus.Active
                return p.status === ProjectStatus.Finished
            })
            this.renderProjects(relevantProjects)
        })

        this.configure()
        this.renderContent()
    }

    configure() {

    }

    renderContent = () => {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + " PROJECTS"

    }

    renderProjects = (projects: Project[]) => {
        this.assignedProjects = projects
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = "";
        for (const project of projects) {
            new ProjectItem(this.element.querySelector('ul')!.id, project)
        }
    }
}

const app = new ProjectInput()
const activeProjectList = new ProjectList("active")
const activeProjectList2 = new ProjectList("finished")