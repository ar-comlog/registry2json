const reg2json = require('../').default;

var value = reg2json.getAllValuesSync("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "ProxyServer");
console.info("Sync:", value);

reg2json.getAllValues("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "ProxyServer")
.then(function(val) {
    console.info("Async:", val);
})
.catch(function(err) {
    console.error(err);
});