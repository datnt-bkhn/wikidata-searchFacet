exports.config = {

  //The address of a running selenium server.
  seleniumAddress: 'http://localhost:4444/wd/hub',

  //Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'firefox'
  },
  baseUrl: 'http://localhost:8000/',

  //Specify the name of the specs files.
  specs: ['firstTest.js'],

  //Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    onComplete: null,
    isVerbose: false,
    showColors: true,
    includeStackTrace: true
  }
};