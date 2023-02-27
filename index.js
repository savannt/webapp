// When this file is ran it prompts the user for a website, we then:
//  - fetch site to ensure it exists
//  - fetch site icon logo
//  - create shortcut on desktop that launches chrome in app mode with this url, icon, and name

const chromePaths = require("chrome-paths");
const child_process = require("child_process");
const colors = require("colors");
const ora = require("ora-classic");
const inquirer = require("inquirer");
const fs = require("fs");
const request = require("request");
const _url = require("url");

const chromePath = chromePaths.chrome;

if(!chromePath) {
    console.log("Chrome not found, please install chrome".red);
    process.exit(1);
}

module.exports = async (url, name) => {
    if(!url) {
        // prompt for url
        url = await inquirer.prompt({
            type: "input",
            name: "url",
            message: "Enter website url"
        });
        url = url.url;
    }
    if(!name) {
        // prompt for site name
        name = await inquirer.prompt({
            type: "input",
            name: "name",
            message: "Enter website name"
        });
        name = name.name;
    }

    if(!url.startsWith("https://")) {
        url = "https://" + url;
    }

    return await new Promise(r => {
        const spinner = ora("Fetching website...").start();

        const faviconUrl = _url.parse(url).protocol + "//" + _url.parse(url).host + "/favicon.ico";
        request(faviconUrl, {encoding: null}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // convert to png
                const data = body.toString("base64");
                spinner.succeed("Favicon fetched");
                
                // write file to ~/.local/share/icons/answers.name.png
                const home = process.env.HOME;
                const iconPath = home + "/.local/share/icons/" + name + ".png";
                fs.writeFile(iconPath, data, "base64", function(err) {
                    if(err) {
                        spinner.fail("Failed to save icon");
                        console.log(err);
                        r(false);
                    } else {
                        spinner.succeed("Icon saved");
    
                        const spinner2 = ora("Creating shortcut...").start();
                        // create .desktop in ~/.local/share/applications
                        const desktopFile = `#!/usr/bin/env xdg-open\n[Desktop Entry]\nName=${name}\nExec="${chromePath}" --test-type --no-first-run --user-data-dir=${name} --app="${url}"\nIcon=${name}\nTerminal=false\nType=Application`;
                        const desktopFilePath = process.env.HOME + "/.local/share/applications/" + name + ".desktop";
                        fs.writeFileSync(desktopFilePath, desktopFile);
                        spinner2.succeed("Shortcut created");
                        r(true);
                    }
                });
            } else {
                spinner.fail("Failed to fetch favicon");
                console.log(error);
                r(false);
            }
        });      
    })
}