import { readFileSync, readdirSync, statSync } from "fs";
import { load } from "js-yaml";
import { extname, join } from "path";

/**
 * Retrieves all YAML files recursively from the specified directory path.
 * @param dirPath The directory path to search for YAML files.
 * @returns An array of YAML file paths.
 */
const getYmlFiles = (dirPath: string = "./" ): string[] => {
  const files = readdirSync(dirPath);
  let arrayOfFiles: string[] = [];
  files.forEach((file): void => {
    if (statSync(join(dirPath, file)).isDirectory()) {
      // Recurse into a subdirectory
      arrayOfFiles = arrayOfFiles.concat(getYmlFiles(join(dirPath, file)));
    } else if ([".yml", ".yaml"].includes(extname(file).toLowerCase())) {
      arrayOfFiles.push(join(dirPath, file));
    }
  });
  return arrayOfFiles;
};

/**
 * Loads the contents of the specified YAML files.
 * @param files An array of YAML file paths.
 * @returns An object containing the parameters and events from the YAML files.
 */
const loadYml = (files: string[]): { parameters: any[]; events: any[] } => {
  let parameters = [];
  let events = [];
  let doc: any;
  files.forEach((file) => {
    try {
      doc = load(readFileSync(file, "utf8"));
    } catch (e) {
      console.error(e);
    }
    if (doc.parameters) parameters.push(...doc.parameters);
    if (doc.events) events.push(...doc.events);
  });
  return { parameters, events };
};

/**
 * Validates the uniqueness of each parameter and event name.
 * @param data An object containing the parameters and events from the YAML files.
 * @returns An array of errors.
 */
const validateYml = (data: { parameters: any[]; events: any[] }): string[] => {
  let errors = [];
  let names = [];
  data.parameters.forEach((param) => {
    if (names.includes(param.name)) {
      errors.push(`Duplicate parameter name: ${param.name}`);
    } else {
      names.push(param.name);
    }
  });
  names = [];
  data.events.forEach((event) => {
    if (names.includes(event.name)) {
      errors.push(`Duplicate event name: ${event.name}`);
    } else {
      names.push(event.name);
    }
  });
  return errors;
}

const ymlFiles = getYmlFiles('./src/');
const ymlData = loadYml(ymlFiles);
console.log(ymlData);
// console.log(JSON.stringify(ymlData, null, 2));
const errors = validateYml(ymlData);
if (errors.length > 0) {
  throw new Error(errors.join("\n"));
}
