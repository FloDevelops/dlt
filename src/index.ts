// import { getYmlFiles, loadYml } from "modules/files";
// import { createGraph } from "modules/graph";
// import { validateYml } from "modules/validation";

import { readFileSync, readdirSync, statSync } from "fs";
import { Graph } from "graphlib";
import { load } from "js-yaml";
import { extname, join } from "path";
import { Event, File, Parameter } from "./types";


/**
 * Retrieves all YAML files recursively from the specified directory path.
 * @param dirPath The directory path to search for YAML files.
 * @returns An array of YAML file paths.
 */
export const getYmlFiles = (dirPath: string = "./src/objects/" ): string[] => {
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
export const loadYml = (files: string[]): { parameters: Parameter[]; events: Event[] } => {
  let parameters: Parameter[] = [];
  let events: Event[] = [];
  let doc: File;
  files.forEach((file): void => {
    try {
      doc = load(readFileSync(file, "utf8"));
    } catch (e) {
      console.error(e);
    }
    if (doc.parameters) parameters.push(...doc.parameters);
    if (doc.events) events.push(...doc.events);
  });
  return { parameters, events };
}

/**
 * Validates the uniqueness of each parameter and event name.
 * @param data An object containing the parameters and events from the YAML files.
 * @returns An array of errors.
 */
export const validateYml = (data: { parameters: Parameter[]; events: Event[] }): string[] => {
  let errors = [];
  let names = [];
  data.parameters.forEach((param) => {
    if (names.includes(param.name)) {
      errors.push(`Duplicate parameter name: ${param.name}`);
    } else {
      names.push(param.name);
    }
  });
  data.events.forEach((event) => {
    if (names.includes(event.name)) {
      errors.push(`Duplicate event name: ${event.name}`);
    } else {
      names.push(event.name);
    }
  });
  return errors;
}

/**
 * Reference nodes between each other
 * @param data An object containing the parameters and events from the YAML files.
 * @returns A graph of the parameters and events.
 */
export const createGraph = (data: { parameters: Parameter[]; events: Event[] }): Graph => {
  let graph = new Graph();
  data.parameters.forEach((param) => {
    graph.setNode(param.name, param);
  });
  data.events.forEach((event) => {
    graph.setNode(event.name, event);
    event.parameters.forEach((param) => {
      graph.setEdge(event.name, param);
    });
  });
  return graph;
}

const startTime = new Date().getTime();

const ymlFiles = getYmlFiles();
const ymlData = loadYml(ymlFiles);
console.log(ymlData);
console.log(JSON.stringify(ymlData, null, 2));
const errors = validateYml(ymlData);
if (errors.length > 0) {
  throw new Error(errors.join("\n"));
}

const graph = createGraph(ymlData);
console.log(graph.edges());

const durationSeconds = (new Date().getTime() - startTime) / 1000;
console.debug(
  `⏩ Parsed in ${durationSeconds} second${durationSeconds >= 2 ? "s" : ""}:
  - ${ymlFiles.length} YAML files
  - ${ymlData.events.length} event${ymlData.events.length > 1 ? "s" : ""}
  - ${ymlData.parameters.length} parameter${ymlData.parameters.length > 1 ? "s" : ""}`
  );
