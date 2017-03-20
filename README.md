# hawkeye
Hawkeye is a project security, vulnerability and general risk highlighting tool.  Designed to be entirely extensible by just adding new modules with the correct signature to `lib/modules`, the idea is to build up a suite of components which can be run stand alone, or as part of your continuous integration pipeline.

Modules implement a handler pattern so they will only run if their given criteria are met, for example the Node Security Project will only run if there is a `package.json` in the target directory.  This enables hawkeye to be language agnostic, and only run the modules relevant to the given scenario.

The added bonus is, it runs from docker; so doesn't require anything on your host machine.

## Modules
The following modules are currently implemented:

 - __File Names (files)__: Scan the file list recursively, looking for patterns as defined in [data.js](lib/modules/files/data.js).  We're looking for things like `id_rsa`, things that end in `pem`, etc.
 - __File Content Patterns (contents)__: Looks for patterns as defined in [data.js](lib/modules/content/data.js) within the contents of files, things like 'password: ', and 'BEGIN RSA PRIVATE KEY' will pop up here.
 - __File Content Entropy (entropy)__:  Scan files for strings with high (Shannon) entropy, which could indicate passwords or secrets stored in the files, for example: 'kwaKM@£rFKAM3(a2klma2d'
 - __Node Security Project (nsp)__: Scan the package.json (if present) and check for vulnerabilities on [Node Security Project](https://github.com/nodesecurity/nsp)
 - __NPM Check Updates (ncu)__: Wraps the [NPM Check Updates](https://github.com/tjunnone/npm-check-updates) module, to highlight outdated dependencies with increasing severity.

__Note:__ Entropy is disabled by default because it can return a lot of results, which are mostly misses, to run it please use the `-m entropy` switch.

__Note:__ We only look inside the contents of files up to 20kb, I plan to add configuration options in the future to allow you to change this.

## Running Hawkeye

### Standalone (command line)
There are two ways to run Hawkeye from the command line, the first is the easiest if you have nodejs on your host, simply type `npm install -g hawkeye-scanner`.

If you don't have, or want anything on your host, you can use docker with `docker run --rm -v $PWD:/target stono/hawkeye`.

__Note__: If you opt for docker and you are on macosx, please be aware that the `osxfs` is approx 20x slower than native filesystem access, so if you're scanning a particularly large project you may experience some slow down and the `npm` choice would be a better option.

### As part of your docker-compose file
This is where Hawkeye is lovely, lets say you have project which has a `Dockerfile`, with lines like this in:
```
COPY . /app
VOLUME /app
```

And your compose file looks like this
```
services:
  app:
    build: .

  hawkeye:
    image: stono/hawkeye
    command: scan -t /app
    volumes_from:
      - app
```

You can simply do `docker-compose run --rm --no-deps hawkeye`.  Woo hoo.

### As part of your GoCD pipeline
If you're using [ci-in-a-box](https://github.com/Stono/ci-in-a-box) or something similar, you can add a pipeline step to run these scans automatically.  This is the template that I use:

```
<pipeline name="security-scan">
  <stage name="Hawkeye" cleanWorkingDir="true">
    <jobs>
      <job name="scan">
        <tasks>
          <exec command="docker">
            <arg>pull</arg>
            <arg>stono/hawkeye</arg>
            <runif status="passed" />
          </exec>
          <exec command="bash">
            <arg>-c</arg>
            <arg>docker pull eu.gcr.io/your-project-name/#{DOCKER_IMAGE}:latest</arg>
            <runif status="passed" />
          </exec>
          <exec command="bash">
            <arg>-c</arg>
            <arg>docker rm -f #{DOCKER_IMAGE}_latest || true</arg>
            <runif status="passed" />
          </exec>
          <exec command="bash">
            <arg>-c</arg>
            <arg>docker run --entrypoint=/bin/true --name=#{DOCKER_IMAGE}_latest eu.gcr.io/your-project-name/#{DOCKER_IMAGE}:latest</arg>
            <runif status="passed" />
          </exec>
          <exec command="bash">
            <arg>-c</arg>
            <arg>docker run --rm --volumes-from #{DOCKER_IMAGE}_latest stono/hawkeye scan --target /app</arg>
            <runif status="passed" />
          </exec>
          <exec command="bash">
            <arg>-c</arg>
            <arg>docker rm -f #{DOCKER_IMAGE}_latest</arg>
            <runif status="any" />
          </exec>
        </tasks>
      </job>
    </jobs>
  </stage>
</pipeline>
```

## Default file lists
Hawkeye will attempt to detect a .git folder in your target, if it is there it will only scan git tracked files.  If there is no .git in the target directory, then all files will be scanned.

You can override this behaviour with the `--all` flag, which will scan all files regardless.

### Options
There are a few options available:

```
14:02:09 $ hawkeye scan --help
[info] Welcome to Hawkeye v0.2.0!

  Usage: hawkeye-scan [options]

  Options:

    -h, --help                             output usage information
    -a, --all                              Scan all files, regardless if a git repo is found
    -f, --fail-on <low, medium, high, critical>  Set the level at which hawkeye returns non-zero status codes (defaults to low)
    -t, --target  </path/to/project>       The location to scan, usually the project root
    -m, --module  <module name>            Run specific module.  Can be specified multiple times
    -j, --json    </path/to/summary,json>  Write JSON output to file.  Can be specified multiple times
```

From a pipeline perspective, the `--fail-on` command is useful, you might now wish for `low` items to break your build, so you could use `--fail-on medium`.

You can specify the `json` and `module` parameters multiple times, for example `hawkeye scan -m files -m contents -j /tmp/file1.json -j /tmp/file2.json` would run the modules `files` and `contents` and write two output files

You can view the module status with `hawkeye modules`:

```
14:02:26 $ hawkeye modules
[info] Welcome to Hawkeye v0.2.0!

[info] File Contents dynamically loaded
[info] Entropy dynamically loaded
[info] Secret Files dynamically loaded
[info] Node Check Updates dynamically loaded
[info] Node Security Project dynamically loaded

Module Status

[info] Enabled:   File Contents (contents)
                  Scans files for dangerous content
[info] Disabled:  Entropy (entropy)
                  Scans files for strings with high entropy
[info] Enabled:   Secret Files (files)
                  Scans for known secret files
[info] Enabled:   Node Check Updates (ncu)
                  Scans a package.json for out of date packages
[info] Enabled:   Node Security Project (nsp)
                  Scans a package.json for known vulnerabilities from NSP
```

## The output
The output is a summary view of what we found, significantly more details can be obtained by using the `--json` flag to write a json artefact.

```
$ docker run --rm -v $PWD:/target stono/hawkeye -j /tmp/results.json

[info] File Contents dynamically loaded
[info] Entropy dynamically loaded
[info] Secret Files dynamically loaded
[info] Node Check Updates dynamically loaded
[info] Node Security Project dynamically loaded
[info] Target for scan: /Users/kstoney/git/stono/hawkeye
[info] Running module File Contents
[info] Running module Secret Files
[info] Running module Node Check Updates
[info]  -> /Users/kstoney/git/stono/hawkeye/node_modules/npm-check-updates/bin/ncu -j
[info] Running module Security Project handling
[info]  -> /Users/kstoney/git/stono/hawkeye/node_modules/nsp/bin/nsp check -o json
[info] scan complete, 16 issues found

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

  - key: A short alphanumeric key for your module
  - name: The name of your module
  - description: The description of your module
  - enabled: True or Fale as to if this module should run by default, or if it needs to be specified with `--module`
  - function handles(path): A function to decide if this handler should run against the target path
  - function run(results, done): The function which is called if handles returns true

### The run function
The first argument passed is `results`, this is where the module should send its results to, it exposes four methods for each 'level' of issue found, `critical`, `high`, `medium` and `low`.  Those methods expect you to pass something like this:

```
results.critial('title', 'description', { additional: 'data' });
```
