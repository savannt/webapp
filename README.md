# webapp
Create chrome web app's easily in any Debain based distro.

## Inspiration
The built in `Web Apps` falls short in a few ways.

Primarily it does not allow user-data-dir persistence or custom chrome flags.

## Installation
```sh
$ npm install @savant/webapp
```

** Usage

Creating a webapp shortcut is simple...
```sh
$ webapp --u|--url <url> --n|--name <name> --i|--icon <iconUrl>
```

You can also launch them from the command line as well...
```sh
$ webapp run <name>
```
This command is expected to output the PID of the launched process. i.e.
```
ProcessID: 1023484
```