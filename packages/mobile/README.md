# @bloom-reader-lite/mobile

Expo/React Native driver wrapping @bloom-reader-lite/app goes here
It should also provide a backend or pseudo-backend to handle native-specific requests.

# Development Notes

After updating something in the "shared" package, you often need to manually Restart Typescript Server (use Ctrl+Shift+P in Visual Studio) before it gets the updates, unfortunately. I'm not sure why it has trouble picking it up.
I guess it may have something to do with using a local package. (Typescript path alias picked up the updates almost instantly)

### Generating Android keystores or iOS credentials

Each unique package identifier needs it own keystores/credentials.

If you need to generate new keystores or credentials... well, you can't do it in non-interactive mode on the Github action runner. So you should do that from your local machine.

You can generate the Android keystores by running `eas build --local --platform android --profile {desiredProfile}`.
If you're on a Windows machine, it'll let you enter the keystore dialog and then it'll fail when it starts building (because only Linux + Mac are supported). Even though it doesn't finish building, the keystore will still be generated and you're good to go.

For iOS, if you're on a windows machine, you can start a cloud build (`eas build -platform ios --profile {desiredProfile}`), fill out the dialogs, and then when it starts uploading your build to the cloud, you can cancel it. It'll still save the credential information and now your non-interactive builds ont he Github action runner will be able to pick up the information.
