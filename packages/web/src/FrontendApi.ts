import {
    RequestToBackend,
    RequestToBackendBase,
} from "bloom-reader-lite-shared/dist/toBackend/requests";
import { MessageToFrontend } from "bloom-reader-lite-shared/dist/toFrontend/messages";
import { ResponseToFrontend } from "bloom-reader-lite-shared/dist/toFrontend/responses";

import { v4 as createGuid } from "uuid";

type MessageType = MessageToFrontend["messageType"];
type FrontendMessageListener = (data: MessageToFrontend) => void;
type PromiseResolveOrReject<T> = {
    resolve: (value: T) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject: (reason?: any) => void;
};
type Id = string;

export class FrontendApi {
    private subscribers: Map<string, FrontendMessageListener[]> = new Map();
    private awaiters: Map<Id, PromiseResolveOrReject<ResponseToFrontend>> =
        new Map();

    /**
     * Sends a simple request to the backend and returns immediately without waiting for a response from the backend.
     */
    public request(request: RequestToBackend & { id?: Id }) {
        const message = JSON.stringify(request);
        console.info("Frontend -> Backend: " + message);

        window.postMessage(message, window.location.origin);
    }

    /**
     * Sends a request to the backend and waits for the response
     * @returns A promise which is fulfilled with the response from the backend.
     *          If there is an error, response.success will be false.
     *          Please check the success field of the response before processing.
     */
    public requestAsync(
        request: RequestToBackendBase
    ): Promise<ResponseToFrontend> {
        // The GUID helps make it easy to ensure that if multiple requests of the same type occur at once,
        // each caller gets the right response.
        const guid = createGuid();

        // Create a promise and save its settlement functions in this.awaiters.
        // When the backend is done, it should find its entry in this.awaiter and invoke the promise's resolve function.
        const promise = new Promise<ResponseToFrontend>((resolve, reject) => {
            this.awaiters.set(guid, {
                resolve,
                reject,
            });

            this.request({
                ...request,
                id: guid,
            });
        });

        return promise;
    }

    /**
     * Allows the backend to respond to the frontend
     */
    public respondToFrontend(response: ResponseToFrontend) {
        const awaiter = this.awaiters.get(response.requestId);
        if (!awaiter) {
            console.warn("Unknown message ID: " + response.requestId);
            return;
        }

        console.info(
            `Frontend received ${response.messageType} response for request ${response.requestId}`
        );
        this.awaiters.delete(response.requestId);

        awaiter.resolve(response);
    }

    /**
     * Allows the frontend to subscribe to receive the specified messages
     */
    public subscribe(
        messageType: MessageType,
        listener: FrontendMessageListener
    ) {
        let currentSubscribers = this.subscribers.get(messageType);
        if (!currentSubscribers) {
            currentSubscribers = [];
            this.subscribers.set(messageType, currentSubscribers);
        }
        currentSubscribers.push(listener);
    }

    /**
     * Allows the frontend to unsubscribe from the specified messages
     */
    public unsubscribe(
        messageType: MessageType,
        listenerToRemove: FrontendMessageListener
    ) {
        const subscribers = this.subscribers.get(messageType);
        if (!subscribers) {
            return;
        }

        const filteredSubscribers = subscribers.filter(
            (x) => x !== listenerToRemove
        );
        this.subscribers.set(messageType, filteredSubscribers);
    }

    /**
     * This function allows the backend (via Javascript injection) to dispatch a message to the frontend.
     * Remarks: Also works to use postMessage as an intermediary, but that's more indirect.
     */
    public notifyFrontend(message: string) {
        console.info("Frontend received notification:\n\t" + message);

        // ENHANCE: Could actually verify the type at runtime using zod/etc.
        // instead just blindly hoping that this is correct
        const data = JSON.parse(message) as MessageToFrontend;

        if (!data.messageType) {
            // Don't recognize the data on this event.
            return;
        }

        const subscribersForThisType = this.subscribers.get(data.messageType);
        subscribersForThisType?.forEach((listener) => {
            listener(data);
        });
    }
}

export function initializeMessageHandler() {
    if (!window.bloomReaderLiteApi) {
        window.bloomReaderLiteApi = new FrontendApi();
        console.info("window.bloomReaderLiteApi initialized");
    }
}
