export default {
  appId: 'com.codeuniverse.app',
  productName: 'Code Universe',
  asar: true,
  directories: {
    output: 'dist_electron',
    buildResources: 'public',
  },
  files: [
    'dist/**/*',
    'dist_electron/**/*',
    'node_modules/**/*',
    'package.json',
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
      {
        target: 'portable',
        arch: ['x64'],
      },
    ],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
  mac: {
    target: [
      'dmg',
      'zip',
    ],
    category: 'public.app-category.education',
  },
  linux: {
    target: [
      'AppImage',
      'deb',
    ],
    category: 'Education',
  },
}
