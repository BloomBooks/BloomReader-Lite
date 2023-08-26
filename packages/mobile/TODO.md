Instead of @shared mapping to @shared/dist, I wonder if it should just map to @shared directly. Skip the whole building the shared thing entirely. One benefit I hope that will achieve is that when consuming packages use Go To Definition in VSCode, they would get the real implementation of functions instead of just the function definitions.

Instead of toBackend/messages, I think it'd be better off conceptually as "requests". And you can rename all the "data" variables to "request" instead too.
