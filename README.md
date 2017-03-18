# hawkeye
Hawkeye is a project scanning tool, designed to be extensible for multiple tools or project types.  The idea is that the whole thing runs inside a container so you dont need any tools on your host, so you can simply add a step to your pipeline and do automated scanning.

Tools currently implemented are:

  - [Node Security Project](https://github.com/nodesecurity/nsp)
  - [NPM Check Updates](https://github.com/tjunnone/npm-check-updates)

__note__: hawkeye is written in node but it absolutely is not intended to just scan node applications.

## Usage
Hawkeye will scan any project that is mounted into `/target`, the modules from `hawkeye/lib/modules` are dynamically loaded and implement a `handler()` function, to decide if they should run against `/target`.  For example, the Node Security Project will only run if `/target/package.json` exists.

To run the scanner against your existing project, simply type `docker run -v $PWD/:/target --rm stono/hawkeye`

## Adding a new handler
The idea is that this project should be super extensible, I want people to write new handlers with ease.  Simply create a handler in `lib/modules` which exposes the following signature:

  - name: The name of your module
  - description: The description of your module
  - handles: A function to decide if this handler should run against the target project
  - run: The function to be called if `.handles()` returns true

## The output
At the moment, the output is simply piped to stdout and stderr, and the process always returns a 0 exit code.  My intention is to add flags for non-zero exit codes (to break your pipeline), and also generate output artefacts.  In the interim however you could always pipe the output to a file with something like `docker run -v $PWD/:/target --rm stono/hawkeye &>/tmp/results.txt`

You should see something like this:
```
[info] Welcome to Hawkeye v0.1.0!

[info] target /target
[info] Node Check Updates loaded
[info] Node Security Project loaded
[info] Node Check Updates handling
[info]  -> /hawkeye/node_modules/npm-check-updates/bin/ncu

 body-parser    ~1.15.1  →  ~1.17.1
 debug           ~2.2.0  →   ~2.6.3
 express        ~4.13.4  →  ~4.15.2
 morgan          ~1.7.0  →   ~1.8.1
 nodemailer      ^2.6.4  →   ^3.1.7
 serve-favicon   ~2.3.0  →   ~2.4.1
 uuid            ^2.0.3  →   ^3.0.1

The following dependencies are satisfied by their declared version range, but the installed versions are behind. You can install the latest versions without modifying your package file by using npm update. If you want to update the dependencies in your package file anyway, run ncu -a.

 async          ^2.1.2  →   ^2.1.5
 jsonwebtoken   ^7.1.9  →   ^7.3.0
 mysql         ^2.11.1  →  ^2.13.0
 request       ^2.75.0  →  ^2.81.0

Run ncu with -u to upgrade package.json

[info] Node Security Project handling
[info]  -> /hawkeye/node_modules/nsp/bin/nsp check
(+) 3 vulnerabilities found
┌───────────────┬─────────────────────────────────────────────────────────────────┐
│               │ Incorrect Handling of Non-Boolean Comparisons During Minificat… │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Name          │ uglify-js                                                       │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ CVSS          │ 8.3 (High)                                                      │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Installed     │ 2.2.5                                                           │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Vulnerable    │ <= 2.4.23                                                       │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Patched       │ >= 2.4.24                                                       │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Path          │ ods-jl@0.0.0 > jade@1.11.0 > transformers@2.1.0 > uglify-js@2.… │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ More Info     │ https://nodesecurity.io/advisories/39                           │
└───────────────┴─────────────────────────────────────────────────────────────────┘
┌───────────────┬─────────────────────────────────────────────────────────────────┐
│               │ Regular Expression Denial of Service                            │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Name          │ negotiator                                                      │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ CVSS          │ 7.5 (High)                                                      │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Installed     │ 0.5.3                                                           │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Vulnerable    │ <= 0.6.0                                                        │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Patched       │ >= 0.6.1                                                        │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Path          │ ods-jl@0.0.0 > express@4.13.4 > accepts@1.2.13 > negotiator@0.… │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ More Info     │ https://nodesecurity.io/advisories/106                          │
└───────────────┴─────────────────────────────────────────────────────────────────┘
┌───────────────┬─────────────────────────────────────────────────────────────────┐
│               │ Regular Expression Denial of Service                            │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Name          │ uglify-js                                                       │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ CVSS          │ 5.3 (Medium)                                                    │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Installed     │ 2.2.5                                                           │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Vulnerable    │ <2.6.0                                                          │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ Patched       │ >=2.6.0                                                         │
├───────────────┼──────────────────────────────────────────���──────────────────────┤
│ Path          │ ods-jl@0.0.0 > jade@1.11.0 > transformers@2.1.0 > uglify-js@2.… │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ More Info     │ https://nodesecurity.io/advisories/48                           │
└───────────────┴─────────────────────────────────────────────────────────────────┘

[info] scan complete
```
