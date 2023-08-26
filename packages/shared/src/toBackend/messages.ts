import { BloomPlayerMessage } from "./bloomPlayerMessages";
import { RequestToBackend } from "./requests";

export type MessageToBackend = BloomPlayerMessage | RequestToBackend;
