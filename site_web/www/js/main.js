document.addEventListener('DOMContentLoaded', event => {
    //$(".dropdown-trigger").dropdown();
    document.querySelectorAll('.dropdown-trigger').forEach(el => M.Dropdown.init(el));

    require.config({ paths: { vs: '/monaco/vs' } });

    require(['vs/editor/editor.main'], function () {
        var editor = monaco.editor.create(document.getElementById('editor'), {
            value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript'
        });
    });

    document.getElementById('run').addEventListener('click', async () => {
        var editor = monaco.editor.getModels()[0];
        var code = editor.getValue();
        let resp = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: code
        });
        let data = await resp.text();
        console.log(data);
    })
})