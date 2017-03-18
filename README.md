# hawkeye
Hawkeye is a project scanning tool, designed to be extensible for multiple tools or project types.  The idea is that the whole thing runs inside a container so you dont need any tools on your host, so you can simply add a step to your pipeline and do automated scanning.

Tools currently implemented are:

  - [Node Security Project](https://github.com/nodesecurity/nsp)
  - [NPM Check Updates](https://github.com/tjunnone/npm-check-updates)

__note__: hawkeye is written in node but it absolutely is not intended to just scan node applications.

## Usage
Hawkeye will scan any project that is mounted into `/target`, the modules from `hawkeye/lib/modules` are dynamically loaded and implement a `handler()` function, to decide if they should run against `/target`.  For example, the Node Security Project will only run if `/target/package.json` exists.

To run the scanner against your existing project, simply type `docker run --rm -v $PWD:/target stono/hawkeye`

### Options
There are a few options available:

```
  Usage: hawkeye-scan [options]

  Options:

    -h, --help                       output usage information
    -t, --target </path/to/project>  The location of the project root
    -m, --modules <module1,module2>  Run specific module(s)
```

## The output
At the moment, the results are simply displayed a consolidated set of tables for each level, for example:

```
$ docker run --rm -v $PWD:/target stono/hawkeye
[info] Welcome to Hawkeye v0.1.0!

[info] target /Users/kstoney/git/john-lewis/hs-development/hs-api
[info] Node Check Updates loaded
[info] Node Security Project loaded
[info] Node Check Updates handling
[info]  -> /Users/kstoney/git/stono/hawkeye/node_modules/npm-check-updates/bin/ncu -j
[info] Node Security Project handling
[info]  -> /Users/kstoney/git/stono/hawkeye/node_modules/nsp/bin/nsp check -o json
[info] scan complete, 10 issues found

critical
┌────────────────────┬────────────────────┬────────────────────────────────────────────────────────────┐
│ key                │ name               │ description                                                │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ nsp-cvss           │ uglify-js          │ ods-jl@0.0.0 > jade@1.11.0 > transformers@2.1.0 > uglify-… │
└────────────────────┴────────────────────┴────────────────────────────────────────────────────────────┘
high
┌────────────────────┬────────────────────┬────────────────────────────────────────────────────────────┐
│ key                │ name               │ description                                                │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ nsp-cvss           │ negotiator         │ ods-jl@0.0.0 > express@4.13.4 > accepts@1.2.13 > negotiat… │
└────────────────────┴────────────────────┴────────────────────────────────────────────────────────────┘
medium
┌────────────────────┬────────────────────┬────────────────────────────────────────────────────────────┐
│ key                │ name               │ description                                                │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ nsp-cvss           │ uglify-js          │ ods-jl@0.0.0 > jade@1.11.0 > transformers@2.1.0 > uglify-… │
└────────────────────┴────────────────────┴────────────────────────────────────────────────────────────┘
low
┌────────────────────┬────────────────────┬────────────────────────────────────────────────────────────┐
│ key                │ name               │ description                                                │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ ncu-outdated       │ body-parser        │ installed: ~1.15.1, available: ~1.17.1                     │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ ncu-outdated       │ debug              │ installed: ~2.2.0, available: ~2.6.3                       │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ ncu-outdated       │ express            │ installed: ~4.13.4, available: ~4.15.2                     │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ ncu-outdated       │ morgan             │ installed: ~1.7.0, available: ~1.8.1                       │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ ncu-outdated       │ nodemailer         │ installed: ^2.6.4, available: ^3.1.7                       │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ ncu-outdated       │ serve-favicon      │ installed: ~2.3.0, available: ~2.4.1                       │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────────┤
│ ncu-outdated       │ uuid               │ installed: ^2.0.3, available: ^3.0.1                       │
└────────────────────┴────────────────────┴────────────────────────────────────────────────────────────┘
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
