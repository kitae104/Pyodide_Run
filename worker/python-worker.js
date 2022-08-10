"use strict";
let pyodide = null;
let stdinbuffer = null;
let rerun = false;
let readlines = [];

const replaceStdioCode = `
import sys
import fakeprint
sys.stdout = fakeprint.stdout
sys.stderr = fakeprint.stdout
sys.stdin = fakeprint.stdin
`;
const stdout = {
    write: (s) => {
        postMessage({
            type: 'stdout',
            stdout: s,
        });
    },
    flush: () => { },
};
const stderr = {
    write: (s) => {
        postMessage({
            type: 'stderr',
            stdout: s,
        });
    },
    flush: () => { },
};
const stdin = {
    readline: () => {
        // Send message to activate stdin mode
        postMessage({
            type: 'stdin',
        });
        let text = '';
        Atomics.wait(stdinbuffer, 0, -1);
        const numberOfElements = stdinbuffer[0];
        stdinbuffer[0] = -1;
        const newStdinData = new Uint8Array(numberOfElements);
        for (let i = 0; i < numberOfElements; i++) {
            newStdinData[i] = stdinbuffer[1 + i];
        }
        const responseStdin = new TextDecoder('utf-8').decode(newStdinData);
        text += responseStdin;
        return text;
    },
};

const run = async (code) => {
    try {
        console.log(code);    
        pyodide.runPython(code);
    } catch (err) {
        postMessage({
        type: 'stderr',
        stderr: err.toString(),
        })
    }
    postMessage({
        type: 'finished',
    })
}
    
const initialise = async () => {
    console.log("initialise>>>");
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.19.0/full/pyodide.js')

        // @ts-ignore
        pyodide = await loadPyodide({
            fullStdLib: false,
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.19.0/full/',       
        });
    postMessage({
        type: 'ready',
    });

    pyodide.registerJsModule('fakeprint', {
        stdout: stdout,
        stderr: stderr,
        stdin: stdin,
    });

    pyodide.runPython(replaceStdioCode);
}

initialise();

onmessage = function (e) {
    console.log("1111");
    console.log(e.data.type);
    switch (e.data.type) {
        case 'run':
            stdinbuffer = new Int32Array(e.data.buffer)
            const code = e.data.code
            run(code)
            break
    }
}