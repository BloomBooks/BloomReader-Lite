import { MessageToBackend } from "@shared-types/toBackend/messages";
import { MessageToFrontend } from "@shared-types/toFrontend/messages";

type MessageType = MessageToFrontend["messageType"];
type FrontendMessageListener = (data: MessageToFrontend) => void;
export class FrontendApi {
    private subscribers: Map<string, FrontendMessageListener[]> = new Map();

    /**
     * Sends a message to the backend.
     */
    public send(obj: MessageToBackend) {
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
}

export function initializeMessageHandler() {
    if (!window.bloomReaderLiteApi) {
        window.bloomReaderLiteApi = new FrontendApi();
        console.log("window.bloomReaderLiteApi initialized");
    }
}
