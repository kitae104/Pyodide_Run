import { WorkerManager } from "/js/wasm/worker-manager.js";

//import "./style.css";

export let term = new Terminal();  

const consoleCode = `
import code
code.interact()
`;
const runButton = document.getElementById('run')
const clearButton = document.getElementById('clear')
const consoleButton = document.getElementById('consoleclear')

window.onload = () => {
    // 터미널 처리 
        

  function clear(){    
    editor.getDoc().setValue('');  
    term.clear();
    term.prompt();
  }

  const stdio = {
      stdout: (s) => { terminal.print(s); },
      stderr: (s) => { terminal.print(s); },
      stdin: async () => {
          return await terminal.wasmShell.prompt();
      }
  };
  runButton.addEventListener('click', (e) => {
      const code = editor.doc.getValue();      
      pyodideWorker.runCode(code);
  });
  runButton.removeAttribute('disabled');
  
  consoleButton.addEventListener('click', (e) => {
    term.clear();
  })
  consoleButton.removeAttribute('disabled')

  clearButton.addEventListener('click', (e) => {
    clear();
  })
  clearButton.removeAttribute('disabled')
  
  
  const pyodideWorker = new WorkerManager('/js/worker/python-worker.js', stdio);
};


  term.open(document.getElementById('terminal'));
  
  let line = "";

  term.prompt = () => {
    term.write(''); 
    //term.setOption('cursorBlink', true);
  }
  term.prompt();  

  var cmd = '';

  // term.on('key', function (key, ev) {  
  //   var printable = (
  //     !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
  //   );
    
  //   if (ev.keyCode == 13) {
  //     if(cmd === 'clear')
  //     {
  //       term.clear();
  //     }
  //     cmd = '';
  //     term.prompt();
  //   } else if (ev.keyCode == 8) {    
      
  //     console.log(cmd.length);
  //     if (cmd.length > 0) {
  //       cmd = cmd.slice(0, cmd.length -1);
  //       term.write('\b \b');
  //     }
      
  //   } else if (printable) {
  //     cmd += key;               // 입력된 키를 가지고 명령어 확인 
  //     term.write(key);
  //   }
  // });
        
  // term.on('paste', function (data, ev) {
  //   term.write(data);
  // });