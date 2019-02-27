[![Discussion on Gitter](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/hawkeye-scanner/Lobby)
[![npm version](https://badge.fury.io/js/%40hawkeyesec%2Fscanner-cli.svg)](https://badge.fury.io/js/%40hawkeyesec%2Fscanner-cli)
[![npm](https://img.shields.io/npm/dt/%40hawkeyesec%2Fscanner-cli.svg)](https://www.npmjs.com/package/%40hawkeyesec%2Fscanner-cli)
[![Build Status](https://travis-ci.org/hawkeyesec/scanner-cli.svg?branch=master)](https://travis-ci.org/hawkeyesec/scanner-cli)
[![Dependency Status](https://david-dm.org/hawkeyesec/scanner-cli.svg)](https://david-dm.org/hawkeyesec/scanner-cli)
[![Hub Pulls](https://img.shields.io/docker/pulls/hawkeyesec/scanner-cli.svg)](https://hub.docker.com/r/hawkeyesec/scanner-cli)
[![Greenkeeper badge](https://badges.greenkeeper.io/hawkeyesec/scanner-cli.svg)](https://greenkeeper.io/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![Hawkeye Logo](screenshots/badlogo.png)

The Hawkeye scanner-cli is a project security, vulnerability and general risk highlighting tool. It is meant to be integrated into your pre-commit hooks and your pipelines.

# Running and configuring the scanner

The Hawkeye scanner-cli assumes that your directory structure is such that it keeps the toolchain's files on top level. Roughly, this is what it boils down to:

* **Node.js** projects have a `package.json` on top level
* **Ruby** projects will have a `Gemfile` on top level
* **Python** projects will have a `requirements.txt` on top level
* **PHP** projects will have a `composer.lock` on top level
* **Java** projects will have a `build` (gradle) or `target` (maven) folder, and include `.java` and `.jar` files

This is not exhaustive as sometimes tools require further files to exist. To understand how the modules decide whether they can handle a project, please check the [How it works](https://github.com/hawkeyesec/scanner-cli#how-it-works) section and the [modules](lib/modules) folder.

#### Docker (recommended)

The docker image is hands-down the easiest way to the scanner. Please note that your project root (e.g. $PWD) needs to be mounted to `/target`.

```bash
docker run --rm -v $PWD:/target hawkeyesec/scanner-cli
```

The docker build is also the recommended way to run the scanner in your CI pipelines. This is an example of running Hawkeye against one of your projects in GoCD:

```xml
<pipeline name="security-scan">
  <stage name="Hawkeye" cleanWorkingDir="true">
    <jobs>
      <job name="scan">
        <tasks>
          <exec command="docker">
            <arg>pull</arg>
            <arg>hawkeyesec/scanner-cli</arg>
            <runif status="passed" />
          </exec>
          <exec command="bash">
            <arg>-c</arg>
            <arg>docker run --rm -v $PWD:/target hawkeyesec/scanner-cli</arg>
            <runif status="passed" />
          </exec>
        </tasks>
      </job>
    </jobs>
  </stage>
</pipeline>
```
#### npm

You can install and run hawkeye in a Node.js project via

```bash
npm install --save-dev @hawkeyesec/scanner-cli
npx hawkeye scan
```

This method is recommended in a Node.js project, where the other toolchains (e.g. python, ruby) are not required.

With this method, it is also recommended to invoke the scanner in a git pre-commit hook (e.g. via the [pre-commit](https://github.com/observing/pre-commit) package) to fail the commit if issues are found.

#### Configuration Files (recommended)

You can configure the scanner via `.hawkeyerc` and `.hawkeyeignore` files in your project root.

The `.hawkeyerc` file is a JSON file that allows you to configure ...

* the modules to run,
* the writers to use, and
* the failure threshold

```json
{
    "all": true|false,
    "staged": true|false,
    "modules": ["files-ccnumber", "java-owasp", "java-find-secbugs"],
    "sumo": "http://your.sumologic.foobar/collector",
    "http": "http://your.logger.foobar/collector",
    "json": "log/results.json",
    "failOn": "low"|"medium"|"high"|"critical",
    "showCode": true|false
}
```

The `.hawkeyeignore` file is a collection of *regular expressions* matching **paths** and **module error codes** to exclude from the scan, and is equivalent to using the `--exclude` flag. Lines starting with `#` are regarded as comments.

**Please note that any special charaters reserved in regular expressions (-[]{}()*+?.,\^$|#\s) need to be escaped when used as a literal!**

Please also note that the module error codes are usually not shown, since they are not primarily relevant for the user. If you want to exclude a certain false positive, you can display the module error codes with the flag `--show-code` or the `showCode` property in the `.hawkeyerc`.

```
^test/

# this is a comment

^README.md
```

#### The CLI

Use `hawkeye modules` to list the available modules and their status.

```
> npx hawkeye modules
[info] Version: v1.4.0
[info] Module Status
[info] Enabled:   files-ccnumber
[info]            Scans for suspicious file contents that are likely to contain credit card numbers
[info] Enabled:   files-contents
[info]            Scans for suspicious file contents that are likely to contain secrets
[info] Disabled:  files-entropy
[info]            Scans files for strings with high entropy that are likely to contain passwords
[info] Enabled:   files-secrets
[info]            Scans for suspicious filenames that are likely to contain secrets
[info] Enabled:   java-find-secbugs
[info]            Finds common security issues in Java code with findsecbugs
[info] Enabled:   java-owasp
[info]            Scans Java projects for gradle/maven dependencies with known vulnerabilities with the OWASP dependency checker
[info] Enabled:   node-crossenv
[info]            Scans node projects for known malicious crossenv dependencies
[info] Enabled:   node-npmaudit
[info]            Checks node projects for dependencies with known vulnerabilities
[info] Enabled:   node-npmoutdated
[info]            Checks node projects for outdated npm modules
[info] Enabled:   node-yarnaudit
[info]            Checks yarn projects for dependencies with known vulnerabilities
[info] Enabled:   node-yarnoutdated
[info]            Checks node projects for outdated yarn modules
[info] Enabled:   php-security-checker
[info]            Checks whether the composer.lock contains dependencies with known vulnerabilities using security-checker
[info] Enabled:   python-bandit
[info]            Scans for common security issues in Python code with bandit.
[info] Enabled:   python-piprot
[info]            Scans python dependencies for out of date packages
[info] Enabled:   python-safety
[info]            Checks python dependencies for known security vulnerabilities with the safety tool.
[info] Enabled:   ruby-brakeman
[info]            Statically analyzes Rails code for security issues with Brakeman.
[info] Enabled:   ruby-bundler-scan
[info]            Scan for Ruby gems with known vulnerabilities using bundler

```

Use `hawkeye scan` to kick off a scan:

```
> npx hawkeye scan --help
[info] Version: v1.3.0
Usage: hawkeye-scan [options]

Options:
  -a, --all                                       Scan all files, regardless if a git repo is found. Defaults to tracked files in git repositories.
  -t, --target [/path/to/project]                 The location to scan. Defaults to $PWD.
  -f, --fail-on [low|medium|high|critical]        Set the level at which hawkeye returns non-zero status codes. Defaults to low.
  -m, --module [module name]                      Run specific module. Defaults to all applicable modules.
  -e, --exclude [pattern]                         Specify one or more exclusion patterns (eg. test/*). Can be specified multiple times.
  -j, --json [/path/to/file.json]                 Write findings to file.
  -s, --sumo [https://sumologic-http-connector]   Write findings to SumoLogic.
  -H, --http [https://your-site.com/api/results]  Write findings to a given url.
  --show-code                                     Shows the code the module uses for reporting, useful for ignoring certain false positives
  -g, --staged                                    Scan only git-staged files.
  -h, --help                                      output usage information
```

# Results

#### Exit Codes

The scanner-cli responds with the following exit codes:

* Exit code 0 indicates no findings above or equal to the minimum threshold were found.
* Exit code 1 indicates that issues were found above or equal to the minimum threshold.
* Exit code 42 indicates that an unexpected error happened somewhere in the program. This is likely a bug and should not happen. Please check the log output and report a bug.

#### Redirecting the console output

If you wish to redirect the console logger output, the recommended method is latching onto stdout. In this example, we're making use of both JSON and stdout results:

```bash
docker run --rm -v $PWD:/target hawkeyesec/scanner-cli -j hawkeye-results.json -f critical 2>&1 | tee hawkeye-results.txt
```

#### Console output

By default, the scanner outputs its results to the console in tabular form.

#### Sumologic

The results can be sent to a SumoLogic collector of your choice. In this example, we have a collector with a single HTTP source.

```
hawkeye scan --sumo https://collectors.us2.sumologic.com/receiver/v1/http/your-http-collector-url
```

In SumoLogic, search for `_collector="hawkeye" | json auto`:

![SumoLogic](screenshots/sumologic.png)

#### Any HTTP endpoint

Similar to the SumoLogic example, the scanner can send the results to any given HTTP endpoint that accepts POST messages.

```
hawkeye scan --http http://your.logging.foobar/endpoint
```

The results will be sent with `User-Agent: hawkeye`. Similar to the console output, the following `JSON` will be POSTed for each finding:

```json
{
  "module": "files-contents",
  "level": "critical",
  "offender": "testfile3.yml",
  "description": "Private key in file",
  "mitigation": "Check line number: 3"
}
```

# How it works

Hawkeye is designed to be extensible by adding modules and writers.

* Add modules in the [modules](lib/modules) folder.
* Add writers in the [writers](lib/writers) folder.

## Modules

Modules are basically little bits of code that either implement their own logic, or wrap a third party tool and standardise the output. They only run if the required criteria are met. For example: The `npm outdated` module would only run if a `package.json` is detected in the scan target - as a result, you don't need to tell Hawkeye what type of project you are scanning.

#### Generic Modules

* **files-ccnumber**: Scans for suspicious file contents that are likely to contain credit card numbers
* **files-contents**: Scans for suspicious file contents that are likely to contain secrets
* **files-entropy**: Scans files for strings with high entropy that are likely to contain passwords. Entropy scanning is disabled by default because of the high number of false positives. It is useful to scan codebases every now and then for keys, in which case please run it please using the `-m files-entropy` switch.
* **files-secrets**: Scans for suspicious filenames that are likely to contain secrets

#### Java

* **java-find-secbugs**: Finds common security issues in Java code with findsecbugs
* **java-owasp**: Scans Java projects for gradle/maven dependencies with known vulnerabilities with the OWASP dependency checker

#### Node.js

* **node-crossenv**: Scans node projects for known malicious [crossenv](http://blog.npmjs.org/post/163723642530/crossenv-malware-on-the-npm-registry) dependencies
* **node-npmaudit**: Checks node projects for dependencies with known vulnerabilities with [npm audit](https://docs.npmjs.com/cli/audit)
* **node-npmoutdated**: Checks node projects for outdated npm modules with [npm outdated](https://docs.npmjs.com/cli/outdated)
* **node-yarnaudit**: Checks yarn projects for dependencies with known vulnerabilities with [yarn audit](https://yarnpkg.com/lang/en/docs/cli/audit/)
* **node-yarnoutdated**: Checks node projects for outdated yarn modules with [yarn outdated](https://yarnpkg.com/en/docs/cli/outdated)

#### PHP

* **php-security-checker**: Checks whether the composer.lock contains dependencies with known vulnerabilities using security-checker

#### Python

* **python-bandit**: Scans for common security issues in Python code with bandit.
* **python-piprot**: Scans python dependencies for out of date packages with [piprot](https://github.com/sesh/piprot)
* **python-safety**: Checks python dependencies for known security vulnerabilities with the safety tool.

#### Ruby

* **ruby-brakeman**: Statically analyzes Rails code for security issues with Brakeman.
* **ruby-bundler-scan**: Scan for Ruby gems with known vulnerabilities using bundler

#### Adding a module

If you have an idea for a module, please feel free open a feature request in the issues section. If you have a bit of time left, please consider sending us a pull request. To see modules work, please head over to the [modules](lib/modules) folder to find how things are working.
