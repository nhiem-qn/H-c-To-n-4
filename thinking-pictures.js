const MIAThinkingPictures=(()=>{
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dots=n=>Array.from({length:Math.max(0,Math.min(20,Number(n)||0))},()=>'<i aria-hidden="true">●</i>').join('');
 function render(p){if(!p||!['rebus','sequence','groups','grid','compare'].includes(p.type))return'';let body='';
 if(p.type==='rebus')body=(p.icons||[]).slice(0,3).map((icon,i)=>`<div class="thinking-clue"><span>${esc(icon)}</span><small>${esc(p.labels?.[i])}</small></div>`).join('<b aria-hidden="true">＋</b>');
 if(p.type==='sequence')body=(p.values||[]).slice(0,8).map(v=>`<b class="thinking-number">${esc(v)}</b>`).join('<span aria-hidden="true">→</span>');
 if(p.type==='groups'||p.type==='compare')body=(p.counts||[]).slice(0,3).map((n,i)=>`<div class="thinking-group"><small>Nhóm ${String.fromCharCode(65+i)}</small><div>${n==null?'<b>?</b>':dots(n)}</div></div>`).join('')+(p.total!=null?`<b class="thinking-total">Tổng: ${esc(p.total)}</b>`:'');
 if(p.type==='grid')body=`<div class="thinking-grid" style="grid-template-columns:repeat(${Math.max(1,Math.min(6,Number(p.cols)||1))},1fr)">${dots((Number(p.rows)||0)*(Number(p.cols)||0))}</div>`;
 return`<figure class="thinking-picture" role="img" aria-label="${esc(p.alt)}">${body}</figure>`}
 return{render};
})();
