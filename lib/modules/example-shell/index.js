'use strict';
const util = require('../../util');
module.exports = function Example(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  // Set your module definition here
  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Example Module';
  self.description = 'Example of how to write a module and shell out a command';
  self.enabled = false;

  let fileManager;
  /* Handles is always passed a fileManager, which is a proxy access to the files
     within the current scan context */
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;

    /* In this case, we always want to run the example, so we can just return true.
       We could however, act on the fileManager.
       For example `return fileManager.exists('package.json')` means we would only
       execute this module if there was a package.json in the target */
    return true;
  };

  /* This function runs if the above .handles returns true */
  self.run = function(results, done) {
    const someCommand = 'ls -A1';

    /* options.exec is a wrapper to execute system commands.
       it returns an object { stdout: "", stderr: "" } */
    options.exec.command(someCommand, {
      // fileManager.target is the root of the target context
      cwd: fileManager.target
    }, (err, data) => {
      const files = data.stdout.split('\n');

      /* Output a critical message, remember the signature here is:
         results.level(offenderName, description, extraInformation, extraDataObject);
         where offenderName, description and extraInformation are all strings
         and extraDataObject is additional context written to the json report */
      results.critical('Example Critical', `${files.length} files in the directory!`, 'some extra info', files);

      // Don't forget to call done, when we're done.
      done();
    });
  };
  return Object.freeze(self);
};
