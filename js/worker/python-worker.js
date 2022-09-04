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
      type: "stdout",
      stdout: s,
    });
  },
  flush: () => {},
};
const stderr = {
  write: (s) => {
    postMessage({
      type: "stderr",
      stdout: s,
    });
  },
  flush: () => {},
};
const stdin = {
  readline: () => {
    // Send message to activate stdin mode
    postMessage({
      type: "stdin",
    });
    let text = "";
    Atomics.wait(stdinbuffer, 0, -1);
    const numberOfElements = stdinbuffer[0];
    stdinbuffer[0] = -1;
    const newStdinData = new Uint8Array(numberOfElements);
    for (let i = 0; i < numberOfElements; i++) {
      newStdinData[i] = stdinbuffer[1 + i];
    }
    const responseStdin = new TextDecoder("utf-8").decode(newStdinData);
    text += responseStdin;
    return text;
  },
};

const run = async (code) => {
  try {
    //console.log(code);
    pyodide.runPython(code);
    // pandastutor
    //const executionTrace = pandastutor_py.run_user_code(code);
  } catch (err) {
    postMessage({
      type: "stderr",
      stderr: err.toString(),
    });
  }
  postMessage({
    type: "finished",
  });
};

const initialise = async () => {
  console.log("initialise>>>");
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.0/full/pyodide.js");

  // @ts-ignore
  pyodide = await loadPyodide({
    fullStdLib: false,
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.0/full/",
  });

  // 패키지 로딩
  await pyodide.loadPackage(["pandas", "micropip"]);
  const micropip = pyodide.pyimport("micropip");
  //await micropip.install("https://files.pythonhosted.org/packages/ca/91/6d9b8ccacd0412c08820f72cebaa4f0c0441b5cda699c90f618b6f8a1b42/requests-2.28.1-py3-none-any.whl");
  //await micropip.install("https://files.pythonhosted.org/packages/d1/cb/4783c8f1a90f89e260dbf72ebbcf25931f3a28f8f80e2e90f8a589941b19/urllib3-1.26.11-py2.py3-none-any.whl");
  await micropip.install("https://files.pythonhosted.org/packages/10/5b/0479d7d845b5ba410ca702ffcd7f2cd95a14a4dfff1fde2637802b258b9b/seaborn-0.11.2-py3-none-any.whl");
  //await micropip.install("https://files.pythonhosted.org/packages/9d/ab/6f107733cfb8b9a18ae197c1d7e358ca85a4831ed4a9bafdc0e603c93ae1/kiwipiepy-0.14.0-cp310-cp310-manylinux_2_17_ppc64le.manylinux2014_ppc64le.whl");

  // pandastutor
  //const pandastutor_py = await pyodide.pyimport("pandas_tutor.main");

  postMessage({
    type: "ready",
  });

  pyodide.registerJsModule("fakeprint", {
    stdout: stdout,
    stderr: stderr,
    stdin: stdin,
  });

  pyodide.runPython(replaceStdioCode);
};

initialise();

onmessage = function (e) {
  console.log(e.data.type);
  switch (e.data.type) {
    case "run":
      stdinbuffer = new Int32Array(e.data.buffer);
      const code = e.data.code;
      run(code);
      break;
  }
};
