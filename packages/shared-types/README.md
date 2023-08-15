This is a way for us to share types between the frontend (web) and the backends (mobile and electron).
This includes types for the postMessages that are passed across the window
It also includes a common API that all backends (e.g. mobile and electron) should implement
This is still kind of a rough draft, don't feel like the design or engineering is 100% locked in.
Right now this is accomplished using through tsconfig's "paths" field in the consuming packages.
Not using yarn workspaces right now because it caused a lot of problems for the Expo project to run.
(yarn workspaces -> hoisting and symlinks, and even though I tried to nohoist some stuff, I was having trouble getting the Expo project to run. But if you solve the yarn workspaces problem, well that could be a path to go to share these types)

One potential issue right now is that all the packages in the repo should be coordinated and kept in sync,
which means it's problematic if you want to make a breaking change to the API types in just mobile but don't want to deal with it in electron yet.
But hey, unless you publish separate packages to NPM, that's probably what you're going to live with for a lot of solutions
