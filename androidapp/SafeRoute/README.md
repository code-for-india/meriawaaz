# Saferoute Android App

Uses gradle for build. To start Download [Android Studio](http://developer.android.com/sdk/installing/studio.html)

Open project -> SafeRoute

Import gradle dependencies, click "Sync Project with Gradle Files"

### Dependencies
Extras -> Google Play Services

Extras -> Google Repository

### Maps API Key
Maps API key from AndroidManifest.xml must be changed becuase it is unique to each project/user (or you can send me you SHA1 signature and I can add it to my account, so you can use the key below, please don't abuse!)
```
<meta-data
            android:name="com.google.android.maps.v2.API_KEY"
            android:value="AIzaSyAc8vZ15ZkVSBX4-7DPFuJPvRTZ8-EaoEc"/>
```
