let currentLanguage = "python3";
document.addEventListener('DOMContentLoaded', event => {
    //$(".dropdown-trigger").dropdown();
    let editor;
    document.querySelectorAll('.dropdown-trigger').forEach(el => M.Dropdown.init(el));

    require.config({ paths: { vs: '/monaco/vs' } });

    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript'
        });
    });

    document.getElementById('run').addEventListener('click', async () => {
        var code = editor.getValue();
        let resp = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: currentLanguage,
                code: code,
            })
        });
        let data = await resp.text();
        console.log(data);
    })
    document.querySelectorAll(".drop-language").forEach(el => {
        el.addEventListener('click', (e) => {
            const monaco_languages = {
                python3: "python",
                python2: "python",
                node: "javascript",
            }
            currentLanguage = e.target.dataset.language;
            document.getElementById("language").innerText = e.target.innerText;
            // var editor = monaco.editor.getModels()[0];
            monaco.editor.setModelLanguage(editor.getModel(), monaco_languages[currentLanguage]);
        })
    })
})