// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  const reports = ['text-summary'];
  const browsers = [];
  const plugins = [
    require('karma-jasmine'),
    require('karma-chrome-launcher'),
    require('karma-jasmine-html-reporter'),
    require('karma-coverage-istanbul-reporter'),
    require('@angular-devkit/build-angular/plugins/karma')
  ];
  const customLaunchers = {};

  if (process.env.CI) {
    reports.push('lcovonly');
    plugins.push(require('karma-firefox-launcher'));
    browsers.push('ChromeHeadlessTravis', 'FirefoxHeadless');
    customLaunchers.ChromeHeadlessTravis = {
      base: 'ChromeHeadless',
      flags: ['--no-sandbox']
    };
    customLaunchers.FirefoxHeadless = {
      base: 'Firefox',
      flags: ['-headless']
    };
  } else {
    browsers.push('ChromeHeadless');
    reports.push('html');
  }

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    customLaunchers,
    plugins,
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../../coverage'),
      reports,
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers,
    singleRun: true,
    restartOnFileChange: true
  });
};
