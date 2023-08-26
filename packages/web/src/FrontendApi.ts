import { MessageToBackend } from "bloom-reader-lite-shared/dist/toBackend/messages";
import {
    RequestToBackend,
    RequestToBackendWithId,
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
    // TODO: clean up this class
    private subscribers: Map<string, FrontendMessageListener[]> = new Map();
    private awaiters: Map<Id, PromiseResolveOrReject<ResponseToFrontend>> =
        new Map();

    /**
     * Sends a message to the backend.
     */
    public send(obj: MessageToBackend | RequestToBackendWithId) {
        const message = JSON.stringify(obj);
        console.log("Sending: " + message);

        // ENHANCE: Maybe the target should be more narrowly scoped rather than blasting "*"
        // Does it work to put window.location.origin here?
        window.postMessage(message, "*"); // any window may receive the message
    }

    /**
     * This function is so that the frontend can register to receive specified messages
     */
    public receive(
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
     * This function allows the backend (via Javascript injection) to dispatch a message to the frontend.
     * Remarks: Also works to use postMessage as an intermediary, but that's more indirect.
     */
    public replyToFrontend(message: string) {
        // TODO: I'm thinking to rename this to "notify"
        console.log("Frontend received message:\n\t" + message);

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

    /**
     * This function is so that the frontend can register to receive specified messages
     */
    public sendToBackendAsync(
        message: RequestToBackend
    ): Promise<ResponseToFrontend> {
        const guid = createGuid();

        const promise = new Promise<ResponseToFrontend>((resolve, reject) => {
            this.awaiters.set(guid, {
                resolve,
                reject,
            });

            this.send({
                ...message,
                id: guid,
            });
        });

        return promise;
    }

    public replyToFrontend2(response: ResponseToFrontend) {
        const awaiter = this.awaiters.get(response.requestId);
        if (!awaiter) {
            console.warn("Unknown message ID: " + response.requestId);
            return;
        }

        console.log(`${response.requestId}, you've got mail!`);

        // ENHANCE: At this point, you could cut {id} off the response object.
        // It's unnecessary noise to the consumer, I think.
        awaiter.resolve(response);
    }

    // public reportErrorToFrontend(
    //     messageId: Id,
    //     statusCode: number,
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     reason: any
    // ) {
    //     const subscriber = this.subscribers2.get(messageId);
    //     if (!subscriber) {
    //         console.warn("Unknown message ID: " + messageId);
    //         return;
    //     }
    //     subscriber.reject({ ...reason, statusCode });
    // }
}

export function initializeMessageHandler() {
    if (!window.bloomReaderLiteApi) {
        window.bloomReaderLiteApi = new FrontendApi();
        console.log("window.bloomReaderLiteApi initialized");
    }
}
