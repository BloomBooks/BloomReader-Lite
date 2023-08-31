Change the status bar color
AppBar needs some padding - amount TBD

Android builds fail in beta and release - Looks like https://github.com/expo/expo/issues/23265. Does this workaround work? https://github.com/expo/expo/issues/23265#issuecomment-1662709655
Well, or if you just publish the packages to the NPM repository, that would solve it for the release case. For local builds, you can continue using yarn link, and we have a viable workaround in local development and alpha mode.
