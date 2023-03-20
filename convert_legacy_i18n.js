const fs = require('fs');
const xliff = require('xliff')
const path = require('path');

function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + '.' : '';

      if (typeof obj[k] === 'object') {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else acc[pre + k] = obj[k];

      return acc;
    }, {});
}

function convertStringsToObjects(obj) {
  // Create a new object to store the converted values
  const newObj = {};

  // Iterate over each key in the input object
  for (let key in obj) {
    // Check if the value is a string
    if (typeof obj[key] === 'string') {
      // Convert the string to an object with "source" and "target" keys
      newObj[key] = {source: key, target: obj[key]};
    } else {
      // If the value is not a string, copy it to the new object as is
      newObj[key] = obj[key];
    }
  }

  // Return the new object with converted values
  return newObj;
}

const languages = ["fi", "sv", "no", "en"];

console.log("Converting ngx-translate JSON files to XLIFF 2.0 files...");

for (const language of languages) {
  const relativePath = `src/assets/i18n/${language}.json`;

  // Join the relative file path with the current working directory to create an absolute path
  const absolutePath = path.join(__dirname, relativePath);

  // Read the contents of the JSON file
  const jsonData = fs.readFileSync(absolutePath, 'utf-8');
  let parsedJson = JSON.parse(jsonData);

  // Flatten the object and console.log the result
  const flattenedJson = flattenObject(parsedJson);

  const formatedJson = {
    "resources": {
      "namespace1": convertStringsToObjects(flattenedJson)
    },
    // "sourceLanguage": "en-US",
    // "targetLanguage": "de-CH"
  }


  xliff.js2xliff(formatedJson).then((xliffString) => {
    console.log(`Writing to src/locale/messages.${language}.xlf`);
    fs.writeFileSync(`src/locale/messages.${language}.xlf`, xliffString);
  });
}



