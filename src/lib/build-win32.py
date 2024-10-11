#!/usr/bin/env python3

import subprocess
import os

ENV = os.environ.copy()
ENV["GOOS"] = "windows"
ENV["GOARCH"] = "386"
SCRIPT_PATH = os.path.dirname(os.path.realpath(__file__))
DIST_PATH = os.path.realpath(os.path.join(SCRIPT_PATH, "..", "..", "dist", "lib"))
EXE_PATH = os.path.join(DIST_PATH, "registry2json.exe")

if not os.path.isdir(DIST_PATH):
	os.makedirs(DIST_PATH, exist_ok=True)

print("*** Building Windows binary registry2json ***")
subprocess.run(
    ['go', 'build', '-o', EXE_PATH, '-ldflags=-s -w', '.'],
    check=True, 
    cwd=SCRIPT_PATH, 
    env=ENV
)

subprocess.run(
    ['upx', '-9', EXE_PATH],
    check=True, 
    cwd=SCRIPT_PATH, 
    env=ENV
)