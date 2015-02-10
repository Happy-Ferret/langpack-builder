#!/usr/bin/env node

'use strict';

var program = require('commander');
var utils = require('../lib/utils');
var path = require('path');

var LangpackBuilder = require('../lib/lp-builder').LangpackBuilder;

var config = {
  GAIA_DEFAULT_LOCALE: 'en-US',
  GAIA_APP_TARGET: 'production',
  MOZILLA_OFFICIAL: 1,
  GAIA_DEVICE_TYPE: 'phone',
  GAIA_DOMAIN: 'gaiamobile.org',
  GAIA_VERSION: null,
  GAIA_DIR: null,
  GAIA_APPS: null,

  LP_RESULT_DIR: null,
  LP_VERSION: '1.0.0',
  LP_APPS: null,
  LP_TASKS: ['copy' ,'optimize'],

  LOCALES: null,
  LOCALE_BASEDIR: null,
};

function getGaiaVersion(gaiaDir) {
  var settingsPath = path.join(gaiaDir, 'build', 'config',
    'common-settings.json');

  return utils.getFileContent(settingsPath).then(function(source) {
    var settings = JSON.parse(source);
    return settings['moz.b2g.version'];
  });
}

function buildLangpack(gaiaDir, localePath, resultPath, locale, tasks) {

  config.GAIA_DIR = gaiaDir;
  config.LP_RESULT_DIR = resultPath;
  config.LOCALES = [locale];
  config.LOCALE_BASEDIR = localePath;
  config.LP_TASKS = tasks;
  getGaiaVersion(gaiaDir).then(function(gaiaVersion) {
    config.GAIA_VERSION = gaiaVersion;

    var lpBuilder = new LangpackBuilder(config);
    lpBuilder.init().then(function() {
      lpBuilder.build();
    });
  });
}

program
  .version('0.0.1')
  .usage('[options] locale-path')
  .option('-g, --gaia <dir>', 'Gaia dir')
  .option('-l, --locale <locale>', 'Locale')
  .option('-j, --json', 'pack json files')
  .option('-s, --source', 'pack source files')
  .option('-t, --target <dir>', 'target directory')
  .parse(process.argv);

var localePath = program.args[0];
var resultPath = program.target || './out/';
var gaiaDir = program.gaia;
var locale = program.locale;

var tasks = [];
if (!program.source && !program.json) {
  tasks = ['copy', 'optimize'];
} else {
  if (program.source) {
    tasks.push('copy');
  }
  if (program.json) {
    tasks.push('optimize');
  }
}

if (!locale || !gaiaDir || program.args.length !== 1) {
  console.log('Example: ./bin/lp-builder.js --gaia /path/to/gaia --locale ab-CD /path/to/gaia-l10n/ab-CD');
  return;
}
buildLangpack(gaiaDir, localePath, resultPath, locale, tasks);
