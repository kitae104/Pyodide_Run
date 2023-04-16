"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};


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
    console.log("readline 수행");

    // Send message to activate stdin mode
    postMessage({
      type: "stdin",
    });
    console.log("check 111 수행");
    let text = "";
    Atomics.wait(stdinbuffer, 0, -1);                       // 메인 스레드가 stdinbuffer에 쓰기를 기다립니다.
    
    console.log("check 222 수행");
    const numberOfElements = stdinbuffer[0];                // 메인 스레드가 stdinbuffer에 쓴 데이터의 길이를 가져옵니다.
    stdinbuffer[0] = -1;                          
    const newStdinData = new Uint8Array(numberOfElements);  // 

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
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.1/full/pyodide.js");

  // @ts-ignore
  pyodide = await loadPyodide({
    fullStdLib: false,
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.1/full/",
  });

  // 패키지 로딩
  await pyodide.loadPackage(["pandas", "micropip", "pytest"]);
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("https://files.pythonhosted.org/packages/10/5b/0479d7d845b5ba410ca702ffcd7f2cd95a14a4dfff1fde2637802b258b9b/seaborn-0.11.2-py3-none-any.whl");

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
