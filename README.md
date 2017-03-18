# hawkeye
Hawkeye is a project scanning tool, designed to be extensible for multiple tools or project types.  The idea is that the whole thing runs inside a container so you dont need any tools on your host, so you can simply add a step to your pipeline and do automated scanning.

Off the shelf checks currently implemented:

  - [Node Security Project](https://github.com/nodesecurity/nsp)
  - [NPM Check Updates](https://github.com/tjunnone/npm-check-updates)

Bespoke checks:

  - File name pattern matching to look for common secret files, like SSH keys, password files etc.
  - File contents pattern matching to look for things like passwords and secret keys inside files.

__note__: hawkeye is written in node but it absolutely is not intended to just scan node applications.

## Usage
Hawkeye will scan any project that is mounted into `/target`, the modules from `hawkeye/lib/modules` are dynamically loaded and implement a `handler()` function, to decide if they should run against `/target`.  For example, the Node Security Project will only run if `/target/package.json` exists.

### With docker
This is the advised method.  To run the scanner against your existing project, simply type `docker run --rm -v $PWD:/target stono/hawkeye`

### With node
If you want to run without docker, just through node - then `npm install -g hawkeye-scanner`, and use `hawkeye scan`.

### Options
There are a few options available:

```
  Usage: hawkeye-scan [options]

  Options:

    -h, --help                            output usage information
    -t, --target </path/to/project>       The location of the project root
    -m, --modules <module1,module2>       Run specific module(s)
    -o, --output </path/to/results.json>  Output the detailed JSON
```

## The output
The output is a summary view of what we found, significantly more details can be obtained by using the `--output` flag to write a json artefact.

```
$ docker run --rm -v $PWD:/target stono/hawkeye -o /tmp/results.json

[info] Welcome to Hawkeye v0.1.0!
[info] target /target
[info] Secret Files loaded
[info] Node Check Updates loaded
[info] Node Security Project loaded
[info] Secret Files handling
[info] Node Check Updates handling
[info]  -> /Users/kstoney/git/stono/hawkeye/node_modules/npm-check-updates/bin/ncu -j
[info] Node Security Project handling
[info]  -> /Users/kstoney/git/stono/hawkeye/node_modules/nsp/bin/nsp check -o json
[info] scan complete, 13 issues found

Critical
┌───────────────┬───────────────────────┬───────────────────────────────────────────────────────────────────┐
│ module        │ name                  │ description                                                       │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ file-contents │ http_signing.md       │ Potential private key in file                                     │
│               │                       │ Line number: 244                                                  │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ files         │ id_rsa                │ Private SSH key                                                   │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ files         │ .tmp/.gnupg/agent.asc │ Potential cryptographic key bundle                                │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ nsp           │ uglify-js             │ https://nodesecurity.io/advisories/39                             │
│               │                       │ ods-jl@0.0.0 > jade@1.11.0 > transformers@2.1.0 > uglify-js@2.2.5 │
└───────────────┴───────────────────────┴───────────────────────────────────────────────────────────────────┘

High
┌───────────────┬───────────────────────┬───────────────────────────────────────────────────────────────────┐
│ module        │ name                  │ description                                                       │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ ncu           │ nodemailer            │ Module is one or more major versions out of date                  │
│               │                       │ Installed: 2.6.4, Available: 3.1.7                                │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ ncu           │ uuid                  │ Module is one or more major versions out of date                  │
│               │                       │ Installed: 2.0.3, Available: 3.0.1                                │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ nsp           │ negotiator            │ https://nodesecurity.io/advisories/106                            │
│               │                       │ ods-jl@0.0.0 > express@4.13.4 > accepts@1.2.13 > negotiator@0.5.3 │
└───────────────┴───────────────────────┴───────────────────────────────────────────────────────────────────┘

Medium
┌───────────────┬───────────────────────┬───────────────────────────────────────────────────────────────────┐
│ module        │ name                  │ description                                                       │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ file-contents │ config/DBConfig.js    │ Potential password in file                                        │
│               │                       │ Line number: 9                                                    │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ file-contents │ routes/admin.js       │ Potential password in file                                        │
│               │                       │ Line number: 597                                                  │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ ncu           │ body-parser           │ Module is one or more minor versions out of date                  │
│               │                       │ Installed: 1.15.1, Available: 1.17.1                              │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ ncu           │ debug                 │ Module is one or more minor versions out of date                  │
│               │                       │ Installed: 2.2.0, Available: 2.6.3                                │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ ncu           │ express               │ Module is one or more minor versions out of date                  │
│               │                       │ Installed: 4.13.4, Available: 4.15.2                              │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ ncu           │ morgan                │ Module is one or more minor versions out of date                  │
│               │                       │ Installed: 1.7.0, Available: 1.8.1                                │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ ncu           │ serve-favicon         │ Module is one or more minor versions out of date                  │
│               │                       │ Installed: 2.3.0, Available: 2.4.1                                │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ nsp           │ uglify-js             │ https://nodesecurity.io/advisories/48                             │
│               │                       │ ods-jl@0.0.0 > jade@1.11.0 > transformers@2.1.0 > uglify-js@2.2.5 │
└───────────────┴───────────────────────┴───────────────────────────────────────────────────────────────────┘

Low
┌───────────────┬───────────────────────┬───────────────────────────────────────────────────────────────────┐
│ module        │ name                  │ description                                                       │
├───────────────┼───────────────────────┼───────────────────────────────────────────────────────────────────┤
│ files         │ .env                  │ PHP dotenv                                                        │
│               │                       │ Environment file that contains sensitive data                     │
└───────────────┴───────────────────────┴───────────────────────────────────────────────────────────────────┘

[info] json results written to: /tmp/results.json
```

And here is a sample from the output.json, you can view the full file [here](test/samples/results.json).
```
  {
    "module": {
      "key": "nsp",
      "name": "Node Security Project",
      "description": "Scans a package.json for known vulnerabilities from NSP"
    },
    "results": {
      "high": [
        {
          "key": "nsp-cvss",
          "name": "negotiator",
          "description": "https://nodesecurity.io/advisories/106\nods-jl@0.0.0 > express@4.13.4 > accepts@1.2.13 > negotiator@0.5.3",
          "data": {
            "id": 106,
            "updated_at": "2016-06-16T20:37:24.000Z",
            "created_at": "2016-05-04T16:34:12.000Z",
            "publish_date": "2016-06-16T17:36:06.000Z",
            "overview": "negotiator is an HTTP content negotiator for Node.js and is used by many modules and frameworks including Express and Koa.\n\nThe header for \"Accept-Language\", when parsed by negotiator is vulnerable to Regular
Expression Denial of Service via a specially crafted string. \n\nTimeline\n\n- April 29th 2016 - Initial report to maintainers\n- April 29th 2016 - Confirm receipt from maintainers\n- May 1st 2016 - Fix confirmed\n- May 5th 2016 - 0.6.1 p
ublished with fix\n- June 16th 2016 - Advisory published (delay was to coordinate fixes in upstream frameworks, Koa and Express)",
            "recommendation": "Upgrade to at least version 0.6.1\n\nExpress users should update to Express 4.14.0 or greater. If you want to see if you are using a vulnerable call,  a quick grep for the `acceptsLanguages` function call in
 your application will tell you if you are using this functionality.",
            "cvss_vector": "CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
            "cvss_score": 7.5,
            "module": "negotiator",
            "version": "0.5.3",
            "vulnerable_versions": "<= 0.6.0",
            "patched_versions": ">= 0.6.1",
            "title": "Regular Expression Denial of Service",
            "path": [
              "ods-jl@0.0.0",
              "express@4.13.4",
              "accepts@1.2.13",
              "negotiator@0.5.3"
            ],
            "advisory": "https://nodesecurity.io/advisories/106"
          }
        }
    ]
....

```

## Development

### Adding a new handler
The idea is that this project should be super extensible, I want people to write new handlers with ease.  Simply create a handler in `lib/modules` which exposes the following signature:

  - name: The name of your module
  - description: The description of your module
  - handles: A function to decide if this handler should run against the target project
  - run: The function to be called if `.handles(results, done)` returns true

### The run function
The first argument passed is results, this is where the module should send its results to, it exposes four methods for each 'level' of issue found, `critical`, `high`, `medium` and `low`.  Those methods expect you to pass something like this:

```
results.critial('issue-key', 'title', 'description', { additional: 'data' });
```

Those results are then parsed, and output as a table.
