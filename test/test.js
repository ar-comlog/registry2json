const registry2json = require('../').default;

// Get single value synchron
let value = registry2json.getValueSync("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "ProxyServer");
console.info("Sync:", value);

// Get single value asynchron
registry2json.getValue("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "ProxyServer")
    .then(function(val) {
        console.info("Async:", val);
    })
    .catch(function(err) {
        console.error(err);
    });

// Get all Values from path synchron
let values = registry2json.getAllValuesSync("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings");
console.info("Sync:", values);

// Get all Values from path asynchron
registry2json.getAllValues("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings")
    .then(function(values) {
        console.info("Async:", values);
    })
    .catch(function(err) {
        console.error(err);
    });