// Note: Hmm, this file is broader than just BR-Lite and maybe should live elsewhere.
// it could live in its own repository, or maybe better would be to be distributed with BloomPlayer

export type BloomPlayerMessage = SendAnalyticsMessage | LogErrorMessage;

export type BloomPlayerMessageTypes = "sendAnalytics" | "logError";

export type SendAnalyticsMessage = {
    messageType: "sendAnalytics";
    event: "comprehension" | string;
    params: {
        possiblePoints: number;
        actualPoints: number;
        percentRight: number;
    };
};

export type LogErrorMessage = {
    messageType: "logError";
    message: string;
};

// TODO: Add the remaining ones.
