#! /usr/bin/env node

const { program } = require("commander");
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");

const webapp = require("./index.js");

program
    .name("webapp")
    .description("Create a webapp from a website")
    .option("-u, --url <url>", "Website url")
    .option("-n, --name <name>", "Website name")
    .option("-i, --icon <icon>", "Website icon")
    .action(async (options) => {
        const url = options.url;
        const name = options.name;
        const icon = options.icon;

        webapp(url, name, icon);
    });

program
    .command("run <app>")
    .description("Run a webapp by its name")
    .action(async (app) => {
        const appDir = path.join(process.env.HOME, ".local/share/applications");
        const appFile = path.join(appDir, `${app}.desktop`);
    
        if (fs.existsSync(appFile)) {
            child_process.exec(`gtk-launch ${app}`, async (error) => {
                if (error) {
                    console.error("Failed to run the webapp:", error);
                } else {
                    // console.log(`Running ${app}...`);
                    // Wait a moment for the process to start
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    // Find the process ID of the launched app
                    child_process.exec(`pgrep -n -f ${app}`, (error, stdout) => {
                        if (error) {
                            console.error("Failed to find the process ID of the launched app:", error);
                        } else {
                            const pid = stdout.trim();
                            console.log(`ProcessID: ${pid}`);
                        }
                    });
                }
            });
        } else {
            console.error(`Webapp '${app}' not found.`);
        }
    });

program.parse(process.argv);