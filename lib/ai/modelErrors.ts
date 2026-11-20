// Thrown for anything that means "the model provider didn't give us a reply": not
// configured, connection refused, timeout, non-2xx, daily allowance used up, or a stream
// that dies mid-reply. The route maps it to a 503 (before the stream opens) or an in-band
// error frame (after), whichever provider is in use.
export class ModelUnavailableError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ModelUnavailableError'
    }
}
