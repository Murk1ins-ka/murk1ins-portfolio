// Motion patterns inspired by Scrolltide's public component previews.
// Original dependency-free implementation; native scroll is preserved.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let motionPreference='on';try{motionPreference=localStorage.getItem('murk1ins-motion-v5')||'on';}catch(_){}
let motionEnabled=false,motionFrame=0,motionRefreshFrame=0,parallaxNodes=[],revealObserver=null;
function updateMotionScroll(){
 motionFrame=0;if(!motionEnabled)return;
 const height=innerHeight,range=document.documentElement.scrollHeight-height;
 document.documentElement.style.setProperty('--reading',range>0?Math.min(1,Math.max(0,scrollY/range)):0);
 parallaxNodes.forEach(node=>{const rect=node.getBoundingClientRect();if(rect.bottom < -100||rect.top>height+100)return;const offset=Math.max(-48,Math.min(48,(height/2-rect.top-rect.height/2)*Number(node.dataset.parallax)));node.style.translate=`0 ${offset.toFixed(2)}px`;});
}
function queueMotionScroll(){if(motionEnabled&&!motionFrame)motionFrame=requestAnimationFrame(updateMotionScroll);}
function refreshMotion(){
 motionRefreshFrame=0;motionEnabled=!reducedMotion.matches&&motionPreference!=='off';
 document.documentElement.classList.toggle('motion-on',motionEnabled);document.documentElement.classList.toggle('motion-off',!motionEnabled);
 const button=$('#motion-toggle');if(button){button.disabled=reducedMotion.matches;button.setAttribute('aria-pressed',String(motionEnabled));button.setAttribute('aria-label',t(motionEnabled?'pauseMotion':'resumeMotion'));button.title=t(motionEnabled?'motionOn':'motionOff');button.innerHTML=motionEnabled?'<span aria-hidden="true">Ⅱ</span>':'<span aria-hidden="true">▷</span>';}
 revealObserver?.disconnect();parallaxNodes=$$('[data-parallax]',app);
 if(!motionEnabled){$$('[data-reveal]',app).forEach(n=>n.classList.remove('reveal-pending','reveal-in'));parallaxNodes.forEach(n=>n.style.removeProperty('translate'));$$('[data-tilt]',app).forEach(n=>{n.style.removeProperty('--tilt-x');n.style.removeProperty('--tilt-y');});cancelAnimationFrame(motionFrame);motionFrame=0;return;}
 revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const node=entry.target;node.classList.remove('reveal-pending');node.classList.add('reveal-in');node.dataset.revealed='true';revealObserver.unobserve(node);});},{threshold:.06,rootMargin:'0px 0px -22px 0px'});
 $$('[data-reveal]',app).forEach((node,i)=>{if(node.dataset.revealed)return;node.style.setProperty('--reveal-delay',`${Math.min(i%4,3)*65}ms`);node.classList.add('reveal-pending');revealObserver.observe(node);});
 queueMotionScroll();
}
function queueMotionRefresh(){if(!motionRefreshFrame)motionRefreshFrame=requestAnimationFrame(refreshMotion);}
const motionDOM=new MutationObserver(queueMotionRefresh);motionDOM.observe(app,{childList:true,subtree:true});
addEventListener('scroll',queueMotionScroll,{passive:true});addEventListener('resize',queueMotionScroll,{passive:true});reducedMotion.addEventListener('change',queueMotionRefresh);
document.addEventListener('click',e=>{if(!e.target.closest('#motion-toggle'))return;motionPreference=motionEnabled?'off':'on';try{localStorage.setItem('murk1ins-motion-v5',motionPreference);}catch(_){}refreshMotion();});
let tiltFrame=0,tiltTarget=null,tiltPoint=null;
app.addEventListener('pointermove',e=>{
 if(!motionEnabled||e.pointerType==='touch')return;const node=e.target.closest('[data-tilt]');if(!node)return;tiltTarget=node;tiltPoint={x:e.clientX,y:e.clientY};if(tiltFrame)return;
 tiltFrame=requestAnimationFrame(()=>{tiltFrame=0;if(!motionEnabled||!tiltTarget?.isConnected||!tiltPoint)return;const rect=tiltTarget.getBoundingClientRect();tiltTarget.style.setProperty('--tilt-x',`${((tiltPoint.x-rect.left)/rect.width-.5)*7}deg`);tiltTarget.style.setProperty('--tilt-y',`${-((tiltPoint.y-rect.top)/rect.height-.5)*5}deg`);});
});
app.addEventListener('pointerout',e=>{const node=e.target.closest('[data-tilt]');if(!node||node.contains(e.relatedTarget))return;node.style.removeProperty('--tilt-x');node.style.removeProperty('--tilt-y');if(node===tiltTarget){tiltTarget=null;tiltPoint=null;}});
document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('motion-background',document.hidden);if(!document.hidden)queueMotionScroll();});
