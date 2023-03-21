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

module.exports = async (url, name, icon, ignoreIcon) => {
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
        
        const iconPrepareSpinner = ora("Finding icon...");

        let iconUrl;

        if(icon) {
            if(icon.startsWith("https://") || icon.startsWith("http://")) {
                if(icon.includes(".png")) {
                    iconUrl = icon;
                    iconPrepareSpinner.succeed("Using remote png as icon");
                } else {
                    iconUrl = _url.parse(iconUrl).protocol + "//" + _url.parse(iconUrl).host + "/favicon.ico";
                    iconPrepareSpinner.succeed("Using custom favicon as icon");
                }
            }
        } else {
            // default URL's use favicon
            iconUrl = _url.parse(url).protocol + "//" + _url.parse(url).host + "/favicon.ico";
            iconPrepareSpinner.succeed("Using favicon as icon");
        }
        
        
        const spinner = ora("Fetching icon...").start();
        request(iconUrl, {encoding: null}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // convert to png
                const data = body.toString("base64");
                spinner.succeed("Icon fetched");
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
                        const userDataDir = `${process.env.HOME}/.config/user-data-dirs/${name}`;
                        const spinner2 = ora("Creating shortcut...").start();
                        // create .desktop in ~/.local/share/applications
                        const desktopFile = `#!/usr/bin/env xdg-open\n[Desktop Entry]\nName=${name}\nExec=env WM_CLASS="${name}" "${chromePath}" --class="${name}" --class-icon=${iconPath} --test-type --no-first-run --user-data-dir="${userDataDir}" --app="${url}"\nIcon=${name}\nTerminal=false\nType=Application`;
                        const desktopFilePath = process.env.HOME + "/.local/share/applications/" + name + ".desktop";
                        fs.writeFileSync(desktopFilePath, desktopFile);
                        fs.chmodSync(desktopFilePath, 0o755); // Set execute permission
                        spinner2.succeed("Shortcut created");
                        r(true);
                    }
                });
            } else {
                if(ignoreIcon) {
                    const spinner2 = ora("Creating shortcut...").start();
                    const userDataDir = `${process.env.HOME}/.config/user-data-dirs/${name}`;
                    const desktopFile = `#!/usr/bin/env xdg-open\n[Desktop Entry]\nName=${name}\nExec=env WM_CLASS="${name}" "${chromePath}" --class="${name}" --class-icon=${iconPath} --test-type --no-first-run --user-data-dir="${userDataDir}" --app="${url}"\nIcon=${name}\nTerminal=false\nType=Application`;
                    const desktopFilePath = process.env.HOME + "/.local/share/applications/" + name + ".desktop";
                    fs.writeFileSync(desktopFilePath, desktopFile);
                    fs.chmodSync(desktopFilePath, 0o755); // Set execute permission
                    spinner2.succeed("Shortcut created");
                    return r(true);  
                }
                spinner.fail("Failed to fetch favicon");
                console.log(error);
                r(false);
            }
        });      
    })
}