// The iOS 27 SDK refuses to launch apps without the UIScene life cycle. Expo 57.0.26 ships the runtime
// half (ExpoAppSceneDelegate, ExpoReactNativeFactoryProvider) but its prebuild template doesn't use it,
// so this plugin applies the SDK 58 template's wiring. Delete it after upgrading to SDK 58 (see D-row in
// docs/DECISIONS.md).
const fs = require('fs');
const path = require('path');
const {
  IOSConfig,
  withAppDelegate,
  withInfoPlist,
  withXcodeProject,
} = require('expo/config-plugins');

const SCENE_DELEGATE = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {}
`;

// Under the scene life cycle SceneDelegate creates the window and starts React Native.
const WINDOW_SETUP = /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s+window = UIWindow[\s\S]*?#endif\n/;
const CLASS_DECLARATION = 'class AppDelegate: ExpoAppDelegate {';

function patchAppDelegate(contents) {
  if (contents.includes('ExpoReactNativeFactoryProvider')) return contents;
  if (!WINDOW_SETUP.test(contents) || !contents.includes(CLASS_DECLARATION)) {
    throw new Error(
      'with-scene-delegate: AppDelegate.swift no longer matches the SDK 57 template.',
    );
  }
  return contents
    .replace(
      CLASS_DECLARATION,
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
    )
    .replace(WINDOW_SETUP, '\n');
}

module.exports = function withSceneDelegate(config) {
  config = withAppDelegate(config, (c) => {
    c.modResults.contents = patchAppDelegate(c.modResults.contents);
    return c;
  });

  config = withInfoPlist(config, (c) => {
    c.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return c;
  });

  return withXcodeProject(config, (c) => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(c.modRequest.projectRoot);
    const filepath = `${projectName}/SceneDelegate.swift`;
    fs.writeFileSync(path.join(c.modRequest.platformProjectRoot, filepath), SCENE_DELEGATE);
    if (!c.modResults.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath,
        groupName: projectName,
        project: c.modResults,
      });
    }
    return c;
  });
};
