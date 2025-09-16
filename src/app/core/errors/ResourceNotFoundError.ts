export class ResourceNotFoundError extends Error {
    private readonly resource: string;

    constructor(resource: string) {
        super(`${resource} não encontrado!`)
        this.resource = resource
        this.name = 'ResourceNotFoundError'
    }

    getResource() {
        return this.resource;
    }
}