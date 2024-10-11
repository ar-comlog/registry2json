"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const LIB_EXE = path_1.default.dirname(__filename) + path_1.default.sep + "lib" + path_1.default.sep + "registry2json.exe";
function run(cmd, args) {
    return new Promise(function (resolve, reject) {
        if (process.platform != "win32") {
            reject("Only Windows is supported");
        }
        // console.info(cmd, args.join(" "));
        let response = '';
        let error = '';
        let proc = (0, child_process_1.spawn)(cmd, args);
        proc.stdout.on('data', function (data) {
            response += data.toString();
        });
        proc.stderr.on('data', function (data) {
            error += data.toString();
        });
        proc.on('close', function (code) {
            if (code == 0) {
                try {
                    let responseStatus = JSON.parse(response);
                    if (responseStatus.Status == "error") {
                        reject(new Error(responseStatus.Error));
                    }
                    else {
                        resolve(responseStatus.Data);
                    }
                }
                catch (e) {
                    reject(e);
                }
            }
            else {
                if (error == '') {
                    error = "Process exited with code " + code;
                }
                reject(error.toString());
            }
        });
    });
}
function runSync(cmd, args) {
    if (process.platform != "win32") {
        throw new Error("Only Windows is supported");
    }
    // console.info(cmd, args.join(" "));
    const proc = (0, child_process_1.spawnSync)(cmd, args, {
        encoding: 'utf-8' // Stellt sicher, dass die Ausgabe als String zurückkommt
    });
    // Ausgabe des Ergebnisses
    //if (proc.stdout) {
    //	console.log('Ausgabe (stdout):\n', proc.stdout);
    //}
    //if (proc.stderr) {
    //	console.error('Fehler (stderr):\n', proc.stderr);
    //}
    if (proc.status == 0) {
        let responseStatus = JSON.parse(proc.stdout);
        if (responseStatus.Status == "error") {
            throw new Error(responseStatus.Error);
        }
        else {
            return responseStatus.Data;
        }
    }
    else {
        if (!proc.error || proc.error.message == '') {
            console.error("Process exited with code " + proc.status + "\n" + proc.stderr);
            throw new Error("Process exited with code " + proc.status + "\n" + proc.stderr);
        }
        else
            throw proc.error;
    }
    // Überprüfe den Rückgabecode des Prozesses
    //if (proc.error) {
    //	console.error('Fehler beim Ausführen des Befehls:', proc.error.message);
    //} else {
    //	console.log('Prozess erfolgreich beendet, Exit-Code:', proc.status);
    //}
}
exports.default = {
    getValue: function (path, key) {
        return run(LIB_EXE, ['--path', path, '--key', key]);
    },
    getValueSync: function (path, key) {
        return runSync(LIB_EXE, ['--path', path, '--key', key]);
    },
    getAllValues: function (path) {
        return run(LIB_EXE, ['--path', path]);
    },
    getAllValuesSync: function (path) {
        return runSync(LIB_EXE, ['--path', path]);
    }
};
//# sourceMappingURL=main.js.map