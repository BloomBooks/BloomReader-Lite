# @bloom-reader-lite/mobile

The mobile app (an Expo/React Native driver wrapping @bloom-reader-lite/web. Handles native-specific requests of the app).

## Initial Setup for dev machine

Prerequisites: node, yarn, [volta](https://docs.volta.sh/guide/getting-started) etc.

```bash
cd packages/mobile

# install dependencies
yarn

# Builds all prerequisites as well as this package itself
yarn build
```

## Initial Setup for your mobile device

BloomReaderLite requires custom native code, so you cannot use the default Expo Go app. Instead, use a "custom build".

### 1: Find a custom development build

-   Look for a "developer" channel build, either from the ["Local Build"](https://github.com/BloomBooks/BloomReader-Lite/actions/workflows/build-local.yml) Github action workflow or the [Expo cloud builds](https://expo.dev/accounts/bloombooks/projects/bloom-reader-lite-mobile/builds).
-   If one doesn't exist yet, you can generate a "developer" build using a variety of methods ways. Any of them are fine.
    -   Go to the ["Local Build"](https://github.com/BloomBooks/BloomReader-Lite/actions/workflows/build-local.yml) Github action workflow, then click "Run workflow" and start a "developer" channel build. Look in the artifacts, download the one for the desired platform, and unzip it to get the APK or IPA file.
    -   Run the "Cloud Build" github action workflow, then look in our [expo.dev account for the build](https://expo.dev/accounts/bloombooks/projects/bloom-reader-lite-mobile/builds) (uses [Expo quota](https://expo.dev/pricing)).
    -   On your development machine, run `yarn eas:build:android` or `yarn eas:build:ios` (or equivalently, `yarn eas build --platform [android|ios] --profile developer`), then look in our [expo.dev account for the build](https://expo.dev/accounts/bloombooks/projects/bloom-reader-lite-mobile/builds) (uses [Expo quota](https://expo.dev/pricing)).
    -   You could build it locally using `yarn eas build --platform [android|ios] --profile developer --local`. However, Android builds only work on Linux or MacOS, and iOS builds only work on MacOS.

### 2: Transfer to phone

-   Transfer the .APK or .IPA file onto your device:
    -   [android] Any traditional way - USB cable, cloud storage (Dropbox / Google Drive / OneDrive), email it to yourself, etc.
    -   [android, iOS] If you did an EAS Cloud Build, go to the build in [expo.dev](https://expo.dev/accounts/bloombooks/projects/bloom-reader-lite-mobile/builds). There will be an "Install" button that you can click. This should generate a QR code that you can scan with your phone to easily download the app.
        It also provides a link that you can copy and send to your device via whatever mechanism is convenient for you, and then you can paste that link in your device's web browser to download the app.
    -   [android, iOS] You can upload the APK or IPA to [Daiwi](https://diawi.com), which similarly to EAS Cloud Build, generates a QR code or link to easily download the app from your device.
    -   [iOS] Use the Mac version of iTunes to drag and drop the .ipa file onto the device.

### 3: Install the app

-   Install the .APK or .IPA file (there may be a ton of security warnings to dismiss since you're installing from outside of the app store and from an unknown developer) and open the app.
-   Once you've installed the developer build, you normally do not need to re-install the app every time you make changes. The only time you need to re-install are if you install new native packages. See "Creating new custom build" section for more details.

### 4: Get the Javascript code:

-   On dev machine, run `yarn start` or `yarn start:expo`
-   Scan the QR code that is printed out in the dev machine's terminal
-   (If needed) Modify Network settings according to https://stackoverflow.com/questions/47966887/expo-lan-configuration-doesnt-work-for-new-reactnative-project (Ensure "Private" not "Public", change IPv4 Interface Metric to 5 instead of Auto or 4.)
    -   Re-scan the QR code. (If needed, restart server and restart the app too)

# Build loop

## Build loop for dev machine

```bash
# install dependencies
yarn

# serve with hot reload
yarn start
```

Any changes you make in [shared], [web], or [mobile] should be hot reloaded.
Note: if you change the file structure in [mobile], hot reloading might not work, restart the development server if necessary.

## Build loop for phone

-   Ensure Expo server running on dev machine (yarn start)
-   Open the custom Expo app on phone
-   Using your phone's camera or QR Scanner, scan the QR code that the Expo server on the dev machine printed out.
    Or, if you've already done this, just select it from the list of recents
-   If working, it should say "Bundling" and shortly thereafter the app should start running on the phone.

## Troubleshooting

-   Error in network response: Ensure network settings correct (see "Modify Network Setup" in Initial Setup)
-   "Cannot connect to Metro": It times out really quickly. Reload the app on your phone.
-   See if clearing the cache will help. `yarn start --clear`. For further cache clearing, refer to [this guide](https://docs.expo.dev/troubleshooting/clear-cache-windows/)
-   Try Android Studio's "Logcat" if you have issues on the Android app (especially on non-development builds) that you can't debug from Javascript. Open up Android Studio, connect the Android device via cable or use an emulator, View -> Tool Windows -> Logcat

## Debugging bloom-player

-   Go to a bloom-player repo at the desired revision.
-   yarn build-dev. (This builds an unminified version)
-   Use "yarn link [...]", or copy the contents of bloom-player's dist/bloomPlayer.js to this repo's assets/web-dist/bloomPlayer/bloomPlayerMin.jsAsset
-   Reload the app
-   Edit this file (bloomPlayerMin.jsAsset) as needed for debugging purposes.
-   Reload the app every time this file changes.
-   Note: If you manually copied the bloomPlayer file and the "copy:webDist" script in package.json runs, you will need to rerun these steps.
-   Alternatively, you can copy the modified bloom-player at the [web] package level instead of in the [mobile] package

## Creating new custom build

-   It's only necessary to do a new custom build if new native code is added
    -   This includes both installing packages that have native Android code or native iOS code, as well as if you write your own custom native module.
-   Otherwise, just doing `yarn start` from your dev machine is sufficient to deliver simpler changes like Typescript code changes or adding a new JS-only module.
-   Precondition: If not already logged in, run `yarn expo login`
-   Android:
    -   Run `yarn eas build --profile development --platform android`
-   iOS
    -   Run `yarn eas build --profile development --platform ios`
    -   You can probably get by without an Apple Developer account if nothing needs to change. When it prompts you if you want to login, you can select "no". Assuming no new iOS devices have been registered to be allowed to use the internal distribution build, then the next question will be "All your registered devices are present in the Provisioning Profile. Would you like to reuse the profile?" You can select "yes" for that. If not, you most likely want to add the newly registered devices to the provisioning profile. Follow the prompts for that.
-   You can also substitute "--platform all" to build both at once. (FYI, this will be billed as 2 builds, not 1)
-   Further Reading: https://docs.expo.dev/development/create-development-builds/

## Credentials needed

-   An Expo user account. Get added to the "BloomBooks" Expo organization by an administrator.
-   Optional: Apple developer account
    -   There is a SIL organization one. Chris Hubbard is the administrator for that. Ask him if you need one.
    -   It is needed for registering more iOS devices.

## Other Topics

## iOS Internal Distribution

This is only necessary for iOS internal distribution builds (cases when eas.json specifies distribution: "internal"). I think this mainly only applies to alpha channel builds.

Internal distribution builds only work on devices whose device ID (UDID) is specified in the provisioning profile.

To register a new device, have the owner of that device visit an Expo register-device link on their computer or iPhone. Here is a link generated for this repo: https://expo.dev/register-device/5105d727-c870-456d-9b68-cecfea115d60

If you need to generate a new link:

-   Precondition: You will need to have an Apple Developer account you can sign in to.
-   Run `yarn eas device:create`
-   You'll be prompted to login to your Apple Developer account if you aren't already.
-   Send the QR code or link to any iOS devices you want to be able to access this. On the device, open the QR code/link, download the profile, then install the profile. (https://docs.expo.dev/build/internal-distribution/#22-configure-app-signing-credentials-for-ios)
-   See [instructions to re-sign a build](https://github.com/expo/eas-cli#eas-buildresign) (or do a full re-build).
    -   I recommend running this in interactive mode (i.e. --non-interactive flag omitted), AKA try running this on a dev machine.
    -   It should ask you about if you want to re-use the provisioning profile (yes) and to confirm which devices you want to be included (make sure any newly added devices are selected)

### Side by side installation

Each of the release channels has its own package identifier (at least when building, not necessarily when submitting to the app store), so you can have Developer, Alpha, Beta, and Release all installed side-by-side on your mobile device.

### Generating Android keystores or iOS credentials

Each unique package identifier needs it own keystores/credentials.

If you need to generate new keystores or credentials... well, you can't do it in non-interactive mode on the Github action runner. So you should do that from your local machine.

You can generate the Android keystores by running `yarn eas build --local --platform android --profile {desiredProfile}`.
If you're on a Windows machine, it'll let you enter the keystore dialog and then it'll fail when it starts building (because only Linux + Mac are supported). Even though it doesn't finish building, the keystore will still be generated and you're good to go.

For iOS, if you're on a windows machine, you can start a cloud build (`yarn eas build -platform ios --profile {desiredProfile}`), fill out the dialogs, and then when it starts uploading your build to the cloud, you can cancel it. It'll still save the credential information and now your non-interactive builds on the Github action runner will be able to pick up the information.

### Tunnel

This will make it so that your phone and your dev machine don't have to be on the same network. In fact, a colleague on the other side of the country can test your local changes this way!
`yarn start:expo --tunnel`
more troubleshooting may be needed afterwards.
