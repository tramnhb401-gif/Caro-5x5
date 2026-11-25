# Deploy Caro

The Render service serves both the Expo web build and the Nest API from one
origin. The Android app uses the same API through an EAS build environment.

## Prerequisites

- Push this repository to GitHub for Render's Blueprint deployment. EAS should
  also run from the mobile project directory inside this repository so its
  workspace dependencies are included in the build archive.
- Create a MongoDB Atlas database and database user. Copy the application
  connection string, select the `caro` database, and URL-encode special
  characters in the username or password.
- Create Render and Expo accounts. The Android preview build runs in Expo's
  cloud build service; an Android SDK is not required for that build.

## Deploy web and API

1. In Render, choose **New > Blueprint** and connect the GitHub repository.
   Render detects `render.yaml`.
2. Enter the Atlas URI when Render asks for `MONGODB_URI`.
3. Open the service's **Connect > Outbound** panel in Render and add the listed
   CIDR ranges to Atlas **Network Access**. Atlas accepts connections only
   from trusted IP ranges. Avoid allowing `0.0.0.0/0` for this setup.
4. Deploy or redeploy. The health check is `/api/v1/health/ready`.
5. Open the generated `https://<service>.onrender.com` URL. The app and API
   share the same origin, so browser CORS configuration is not needed.

The free Render service can sleep while idle, so its first response after a
period without traffic may take longer. The local Docker MongoDB remains
separate and is not used by the deployed service.

## Connect an Android build to the deployed API

From the repository root, sign in to Expo, then link the app and build an APK
for the Android Emulator:

```powershell
Set-Location .\src\apps\mobile
pnpm dlx eas-cli login
pnpm dlx eas-cli build:configure
# Replace the URL below with the exact URL Render gives your service.
pnpm dlx eas-cli env:set --name EXPO_PUBLIC_API_URL --value https://<service>.onrender.com --environment preview --visibility plaintext
pnpm dlx eas-cli build --platform android --profile preview
pnpm dlx eas-cli build:run --platform android --latest
```

Start `Medium_Phone_API_37.0` in Android Studio Device Manager before the last
command. If EAS cannot detect it, download the APK from the Expo build page and
drag the APK onto the running emulator.

`EXPO_PUBLIC_API_URL` is embedded in the app bundle and must contain no secret.
The MongoDB URI stays only in Render's server environment.

## Local Android development

For live development against the local API, set
`EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` in `src/apps/mobile/.env`;
`10.0.2.2` routes from the Android emulator to the host computer. `localhost`
inside Android refers to the emulator itself. Start MongoDB and the API with:

```powershell
docker compose up -d mongodb
```

In a second PowerShell window, run:

```powershell
pnpm --filter api start:dev
```

The local native build command is:

```powershell
pnpm --filter mobile android
```

This Windows + pnpm workspace currently hits a CMake/Ninja path-length error in
React Native native modules during that local build. The EAS preview APK above
is the working route for running Caro in the Android Studio emulator while that
local toolchain issue is unresolved.
