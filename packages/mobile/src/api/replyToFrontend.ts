import { MessageToFrontend } from "@shared/toFrontend/messages";

export type IReplyToFrontEnd = (message: MessageToFrontend) => void;
