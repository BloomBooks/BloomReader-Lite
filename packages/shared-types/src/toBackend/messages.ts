import { BloomPlayerMessages } from "./bloomPlayerMessages";
import { BloomReaderWebappMessages } from "./bloomReaderWebMessages";

/**
 * All the postMessage MessageEvents that BloomReader-Lite should expect to handle
 */
export type MessageToBackend = BloomPlayerMessages | BloomReaderWebappMessages;
