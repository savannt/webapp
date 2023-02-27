#! /usr/bin/env node


const { program } = require("commander");

const webapp = require("./index.js");

program
    .name("webapp")
    .description("Create a webapp from a website")
    .option("-u, --url <url>", "Website url")
    .option("-n, --name <name>", "Website name")
    .action(async (options) => {
        const url = options.url;
        const name = options.name;

        webapp(url, name);
    });

program.parse(process.argv);