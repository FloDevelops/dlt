"use strict";

import { readFileSync, readdirSync, statSync } from "fs";
import { load } from "js-yaml";
import { extname, join } from "path";

const getYmlFiles = function (dirPath, arrayOfFiles) {
  const files = readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (statSync(join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getYmlFiles(join(dirPath, file), arrayOfFiles);
    } else if ([".yml", ".yaml"].includes(extname(file).toLowerCase())) {
      arrayOfFiles.push(join(dirPath, file));
    }
  });
  return arrayOfFiles;
};

const loadYml = function (files) {
  let parameters = [];
  let events = [];
  let doc;
  files.forEach((file) => {
    try {
      doc = load(readFileSync(file, "utf8"));
    } catch (e) {
      console.error(e);
    }
    if (doc.parameters) parameters.push(doc.parameters);
    if (doc.events) events.push(doc.events);
  });
  return { parameters, events };
};

const ymlFiles = getYmlFiles("./");
const ymlData = loadYml(ymlFiles);
console.log(JSON.stringify(ymlData, null, 2));
