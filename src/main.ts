import {spawn, spawnSync} from 'child_process';
import path from 'path';

const LIB_EXE = path.dirname(__filename) + path.sep + "lib" + path.sep + "registry2json.exe";

function run(cmd: string, args: any[]): Promise<any> {
	return new Promise(function (resolve, reject) {
		if (process.platform != "win32") {
			reject("Only Windows is supported");
		}

		// console.info(cmd, args.join(" "));

		let response = '';
		let error = '';
		let proc = spawn(cmd, args);
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
						reject(new Error(responseStatus.Error))
					}
					else {
						resolve(responseStatus.Data)
					}
				} catch (e) {
					reject(e)
				}
			} else {
				if (error == '') {
					error = "Process exited with code " + code;
				}
				reject(error.toString())
			}
		});
	});
}

function runSync(cmd: string, args: any[]): any {
	if (process.platform != "win32") {
		throw new Error("Only Windows is supported");
	}

	// console.info(cmd, args.join(" "));

	const proc = spawnSync(cmd, args, {
		encoding: 'utf-8' // Stellt sicher, dass die Ausgabe als String zurückkommt
	});

	if (proc.status == 0) {
		let responseStatus = JSON.parse(proc.stdout);
		if (responseStatus.Status == "error") {
			throw new Error(responseStatus.Error)
		}
		else {
			return responseStatus.Data
		}
	}
	else {
		if (!proc.error || proc.error.message == '') {
			console.error("Process exited with code " + proc.status + "\n" + proc.stderr)
			throw new Error("Process exited with code " + proc.status + "\n" + proc.stderr);
		}
		else throw proc.error
	}
}

// noinspection JSUnusedGlobalSymbols
export default {
	getValue: function (path: string, key: string): Promise<any> {
		return run(LIB_EXE, ['--path', path, '--key', key]);
	},

	getValueSync: function (path: string, key: string) {
		return runSync(LIB_EXE, ['--path', path, '--key', key]);
	},

	getAllValues: function (path: string): Promise<any> {
		return run(LIB_EXE, ['--path', path]);
	},

	getAllValuesSync: function (path: string): any {
		return runSync(LIB_EXE, ['--path', path]);
	}
}
