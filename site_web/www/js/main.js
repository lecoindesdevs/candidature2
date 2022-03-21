let currentLanguage = "";
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
    fetch('/api/languages').then(res => res.json()).then(languages => {
        let dropdown = document.getElementById('language-dropdown');

        currentLanguage = languages[0].language;
        document.getElementById("language").innerText = languages[0].name;
        
        languages.forEach(lang => {
            let option = document.createElement('a');
            option.classList.add('drop-language');
            option.dataset.language = lang.language;
            option.innerText = lang.name;
            option.addEventListener('click', (e) => {
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
            let li = document.createElement('li');
            li.appendChild(option);
            dropdown.appendChild(li);
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