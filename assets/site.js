document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click',async()=>{
    const code=document.getElementById(button.dataset.copy);
    const status=button.parentElement.querySelector('[role="status"]');
    try { await navigator.clipboard.writeText(code.textContent); status.textContent='Command copied.'; button.textContent='Copy again'; }
    catch { const range=document.createRange();range.selectNodeContents(code);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='Copy unavailable. The command is selected; use your browser’s Copy action.'; }
  });
});
const topic=document.querySelector('#topic');
if(topic) topic.addEventListener('change',()=>{
 let shown=0;
 document.querySelectorAll('[data-topics]').forEach(row=>{row.hidden=topic.value!=='all'&&!JSON.parse(row.dataset.topics).includes(topic.value);if(!row.hidden)shown++;});
 document.querySelector('#filter-status').textContent=`${shown} ${shown===1?'explanation':'explanations'}`;
});
