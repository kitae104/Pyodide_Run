(function () {
  'use strict';

  function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }//!htmlEditor

  const {EditorView, basicSetup} = CM["codemirror"];
  const {autocompletion} = CM["@codemirror/autocomplete"];
  const {html} = CM["@codemirror/lang-html"];

  new EditorView({
    doc: "<!doctype html>\n<html>\n  \n</html>",
    extensions: [
      basicSetup,
      html(),
    ],
    parent: document.querySelector("#editor-html")
  });





  function myCompletions(context) {
    let word = context.matchBefore(/\w*/);
    if (word.from == word.to && !context.explicit)
      return null
    return {
      from: word.from,
      options: [
        {label: "match", type: "keyword"},
        {label: "hello", type: "variable", info: "(World)"},
        {label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro"}
      ]
    }
  }

  //!createOverride

  new EditorView({
    doc: "Press Ctrl-Space in here...\n",
    extensions: [basicSetup, autocompletion({override: [myCompletions]})],
    parent: document.querySelector("#editor-override")
  });

  //!completeFromGlobalScope

  const {syntaxTree} = CM["@codemirror/language"];

  const completePropertyAfter = ["PropertyName", ".", "?."];
  const dontCompleteIn = ["TemplateString", "LineComment", "BlockComment",
                          "VariableDefinition", "PropertyDefinition"];

  function completeFromGlobalScope(context) {
    let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

    if (completePropertyAfter.includes(nodeBefore.name) &&
        _optionalChain([nodeBefore, 'access', _ => _.parent, 'optionalAccess', _2 => _2.name]) == "MemberExpression") {
      let object = nodeBefore.parent.getChild("Expression");
      if (_optionalChain([object, 'optionalAccess', _3 => _3.name]) == "VariableName") {
        let from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
        let variableName = context.state.sliceDoc(object.from, object.to);
        if (typeof window[variableName] == "object")
          return completeProperties(from, window[variableName])
      }
    } else if (nodeBefore.name == "VariableName") {
      return completeProperties(nodeBefore.from, window)
    } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
      return completeProperties(context.pos, window)
    }
    return null
  }

  //!completeProperties

  function completeProperties(from, object) {
    let options = [];
    for (let name in object) {
      options.push({
        label: name,
        type: typeof object[name] == "function" ? "function" : "variable"
      });
    }
    return {
      from,
      options,
      validFor: /^[\w$]*$/
    }
  }

  //!globalJavaScriptCompletions

  const {javascriptLanguage} = CM["@codemirror/lang-javascript"];

  const globalJavaScriptCompletions = javascriptLanguage.data.of({
    autocomplete: completeFromGlobalScope
  });

  //!createJavaScriptEditor

  new EditorView({
    doc: "// Get JavaScript completions here\ndocument.b",
    extensions: [
      basicSetup,
      javascriptLanguage,
      globalJavaScriptCompletions,
      autocompletion()
    ],
    parent: document.querySelector("#editor")
  });

})();