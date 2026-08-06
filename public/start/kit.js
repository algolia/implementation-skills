document.querySelectorAll('.alg .block .copy').forEach(function(b){
  b.addEventListener('click', function(){
    var pre = b.parentElement.querySelector('pre');
    if(!pre) return;
    var t = pre.innerText.replace(/ /g,' ');
    if(pre.classList.contains('term')){
      t = t.split('\n').map(function(l){ return l.replace(/^\s*\$\s/,''); }).join('\n');
    }
    t = t.trim();
    var lbl = b.textContent;
    var done = function(){
      b.textContent='Copied ✓'; b.classList.add('done');
      setTimeout(function(){ b.textContent=lbl; b.classList.remove('done'); },1700);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(done,function(){fb(t,done);});
    } else { fb(t,done); }
  });
});
function fb(t,cb){
  var a=document.createElement('textarea');
  a.value=t; a.setAttribute('readonly',''); a.style.position='fixed'; a.style.top='-1000px';
  document.body.appendChild(a); a.select();
  try{document.execCommand('copy');cb();}catch(e){}
  document.body.removeChild(a);
}
document.querySelectorAll('.alg .tabs').forEach(function(g){
  var bs=[].slice.call(g.querySelectorAll('.tabbar button'));
  var ps=[].slice.call(g.querySelectorAll('[role="tabpanel"]'));
  function show(i,f){
    bs.forEach(function(b,j){
      b.setAttribute('aria-selected', j===i?'true':'false');
      b.tabIndex = j===i?0:-1;
    });
    ps.forEach(function(p,j){ p.classList.toggle('on', j===i); });
    if(f) bs[i].focus();
    try{ localStorage.setItem('alg-tool', bs[i].dataset.tool); }catch(e){}
  }
  bs.forEach(function(b,i){
    b.addEventListener('click',function(){ show(i,false); });
    b.addEventListener('keydown',function(e){
      var d = e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
      if(!d) return;
      e.preventDefault(); show((i+d+bs.length)%bs.length,true);
    });
  });
  var w=null;
  try{ w=localStorage.getItem('alg-tool'); }catch(e){}
  var idx=0;
  if(w) bs.forEach(function(b,j){ if(b.dataset.tool===w) idx=j; });
  show(idx,false);
});
