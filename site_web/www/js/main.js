let currentLanguage = "";
let editor;
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function setupLanguage(language) {
    const monaco_languages = {
        python3: "python",
        python2: "python",
        node: "javascript",
    }
    currentLanguage = language.language;
    document.getElementById("language").innerText = language.name;
    new Promise(async (resolve, reject) =>  {
        while (!editor) {
            await sleep(50);
        }
        resolve(editor)
    }).then(e => monaco.editor.setModelLanguage(e.getModel(), monaco_languages[currentLanguage]))
}

document.addEventListener('DOMContentLoaded', event => {
    document.querySelectorAll('.dropdown-trigger').forEach(el => M.Dropdown.init(el));

    require.config({ paths: { vs: '/monaco/vs' } });

    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('editor'), {
            language: 'plaintext',
        });
    });
    fetch('/api/languages').then(res => res.json()).then(languages => {
        let dropdown = document.getElementById('language-dropdown');

        setupLanguage(languages[0]);

        languages.forEach(lang => {
            let option = document.createElement('a');
            option.classList.add('drop-language');
            option.dataset.language = lang.language;
            option.innerText = lang.name;
            option.addEventListener('click', (e) => setupLanguage(lang));
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
        el.addEventListener('click', _ => setupLanguage({
            name: el.innerText,
            language: el.dataset.language
        }));
    })
})