# Modules

Appending modules is fairly straightforward by adding a subfolder that adheres to the following criteria:

#### Folder naming convention

Please adhere to the folder naming convention `[language]-[tool]`, e.g. `node-npmaudit`.

#### index.js

This is the actual module

* Exposes a `key` property by which it can be uniquely identified, typically the folder name
* Exposes a `description` property with a meaningful explanation of what it is supposed to do
* Exposes an `enabled` property that indicates whether this module should run by default. Modules that can produce many false positives should not run by default.
* Exposes an asynchronous `handles` hook that resolves to `true` or `false`, indicating that this module can run on the `target` folder. The `handles` hook receives an instance of `FileManager` which acts as a proxy to the files within the `target`.
* Exposes an asynchronous `handles` hook that resolves with an instance of `ModuleResults` that gathers the findings of this module. The `handles` hook receives an instance of `FileManager` which acts as a proxy to the files within the `target`.

```javascript
'use strict'

const path = require('path')
const ModuleResults = require('../../results')
const exec = require('../../exec')

const key = __dirname.split(path.sep).pop()
module.exports = {
  /**
   * Module Metadata
   */
  key,
  description: 'Example of how to write a module and shell out a command',

  /**
   * Is the module enabled by default
   */
  enabled: false,

  /**
   * Determines whether the module is able to run on the target
   *
   * @param {FileManager} fm Proxy access to the files within the current scan context
   * @returns {Boolean} true if the module should run, false otherwise
   */
  handles: fm => true,

  /**
   * The actual execution of the module.
   *
   * @param {FileManager} fm Proxy access to the files within the current scan context
   * @returns {Promise}
   */
  run: async fm => {
    const results = new ModuleResults(key)
    const { stdout } = exec.command('ls -al', { cwd: fm.target })
    results.low({ offender: '', code: 4, description: '', mitigation: '' })
    results.medium({ offender: '', code: 3, description: '', mitigation: '' })
    results.high({ offender: '', code: 2, description: '', mitigation: '' })
    results.critical({ offender: '', code: 1, description: '', mitigation: '' })

    return results
  }
}
```

#### Tests

Please co-locate your tests in the `__tests__` subfolder and add all the necessary samples for unit testing the module therein.
