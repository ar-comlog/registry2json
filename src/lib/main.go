//go:build windows
// +build windows

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"strings"

	"golang.org/x/sys/windows/registry"
)

var (
	pathFlag  string
	keyFlag   string
	valueFlag string
)

type Result struct {
	Status string
	Error  *string
	Data   interface{}
}

func parsePath(path string) (string, registry.Key) {
	for strings.HasPrefix(path, "\\") {
		path = path[1:]
	}

	if strings.HasPrefix(path, "HKEY_CLASSES_ROOT\\") {
		path = path[18:]
		return path, registry.CLASSES_ROOT
	} else if strings.HasPrefix(path, "HKEY_CURRENT_USER\\") {
		path = path[18:]
		return path, registry.CURRENT_USER
	} else if strings.HasPrefix(path, "HKEY_LOCAL_MACHINE\\") {
		path = path[19:]
		return path, registry.LOCAL_MACHINE
	} else if strings.HasPrefix(path, "HKEY_USERS\\") {
		path = path[11:]
		return path, registry.USERS
	} else if strings.HasPrefix(path, "HKEY_CURRENT_CONFIG\\") {
		path = path[20:]
		return path, registry.CURRENT_CONFIG
	} else {
		return path, registry.CURRENT_USER
	}
}

func readRegistryValue(path string, key string) (val string, err error, valtype uint32) {
	regpath, regkey := parsePath(path)

	k, err := registry.OpenKey(regkey, regpath, registry.QUERY_VALUE)
	if err != nil {
		return "", err, 0
	}
	defer k.Close()

	// Beispiel: Lese den Wert des "ProxyServer" Eintrags
	result, valtype, err := k.GetStringValue(key)
	if err != nil {
		return "", err, valtype
	}

	return result, nil, valtype
}

func readRegistryAllValues(path string) (map[string]interface{}, error) {
	var resData map[string]interface{} = make(map[string]interface{})

	regpath, regkey := parsePath(path)
	k, err := registry.OpenKey(regkey, regpath, registry.QUERY_VALUE)
	if err != nil {
		return resData, err
	}

	// Lese alle Wertnamen des Schlüssels
	valueNames, err := k.ReadValueNames(0)
	if err != nil {
		return resData, err
	}

	// Schleife über alle Werte und gebe sie aus
	for _, valueName := range valueNames {
		defVal, valType, err := k.GetValue(valueName, nil)
		if err != nil {
			return resData, err
			// continue
		}

		// Gib den Wert entsprechend dem Typ aus
		switch valType {
		case registry.SZ, registry.EXPAND_SZ:
			val, _, err := k.GetStringValue(valueName)
			if err != nil {
				return resData, err
			}
			resData[valueName] = val
			//fmt.Printf("Wertname: %s, Typ: String, Wert: %s\n", valueName, val.(string))
		case registry.DWORD:
			val, _, err := k.GetIntegerValue(valueName)
			if err != nil {
				return resData, err
			}
			resData[valueName] = val
			//fmt.Printf("Wertname: %s, Typ: DWORD, Wert: %d\n", valueName, val.(uint32))
		case registry.BINARY:
			val, _, err := k.GetBinaryValue(valueName)
			if err != nil {
				return resData, err
			}
			resData[valueName] = val
		case registry.MULTI_SZ:
			val, _, err := k.GetStringsValue(valueName)
			if err != nil {
				return resData, err
			}
			resData[valueName] = val
		default:
			resData[valueName] = defVal
		}
	}

	defer k.Close()

	return resData, nil
}

func writeRegistryValue(key string, name string, value string) error {
	return fmt.Errorf("Muss noch programmiert werden")
}

func main() {
	// Öffnet den Registry-Schlüssel: HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings
	flag.StringVar(&pathFlag, "path", "", "Path of registry begins with HKEY_...\\")
	flag.StringVar(&keyFlag, "key", "", "Key from path (for example ProxyServer)")
	flag.StringVar(&valueFlag, "value", "", "Value to set")
	flag.Parse()

	if pathFlag == "" {
		fmt.Println("Missing --path argument")
		return
	}

	var res Result

	if keyFlag != "" {
		if valueFlag != "" {
			// Registry schreiben
			// TODO Rückgabe verarbeiten
			err := writeRegistryValue(pathFlag, keyFlag, valueFlag)
			if err != nil {
				errStr := err.Error()
				res = Result{Status: "error", Error: &errStr, Data: nil}
			} else {
				res = Result{Status: "success", Data: nil}
			}
		} else {
			// Registry lesen
			val, err, _ := readRegistryValue(pathFlag, keyFlag)
			if err != nil {
				errStr := err.Error()
				res = Result{Status: "error", Error: &errStr, Data: nil}
			} else {
				res = Result{Status: "success", Data: val}
			}

		}
	} else {
		values, err := readRegistryAllValues(pathFlag)
		if err != nil {
			errStr := err.Error()
			res = Result{Status: "error", Error: &errStr, Data: nil}
		} else {
			res = Result{Status: "success", Data: values}
		}
	}

	json, err := json.Marshal(res)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(json))
}
