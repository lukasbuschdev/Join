declare class User {
    id: string
    name: string
    color: string
    img: string
    password: string
    email: string
    contacts: string[]
    pendingFriendshipRequests: string[]
    constructor()
    getName(): string
}

declare class Board {
    id: string
    name: string
    owner: string
    collaborators: string[]
    dateOfCreation: string
    dateOfLastEdit: string
    tasks: { [taskId: string]: any }
    categories: { [name: string]: string }
    constructor({ id, name, owner, collaborators, dateOfCreation, dateOfLastEdit, tasks, categories }: {
        id: string
        name: string
        owner: string
        collaborators: string[]
        dateOfCreation: string
        dateOfLastEdit: string
        tasks: { [taskId: string]: any }
        categories: { [name: string]: string }
    })
}

interface Window {
    USER: User | undefined
    BOARDS: Board[] | undefined
    SELECTED_BOARD: Board | undefined
}

interface Array<T> {
    filteredMap(cb: (item: T, index?: number, filteredMap?: typeof this) => any): Array<T>
    filteredFlatMap(cb: (item: T, index: number, filteredMap: typeof this) => any, depth?: number): Array<T>
}

interface HTMLElement {
    $<T extends keyof HTMLElementTagNameMap>(selector: T): HTMLElementTagNameMap[T]
    $$<T extends keyof HTMLElementTagNameMap>(selector: T): NodeListOf<HTMLElementTagNameMap[T]>
}

/**
 * 
 * @param {number} input
 * @returns {string}
 */
declare function test(input: number): number