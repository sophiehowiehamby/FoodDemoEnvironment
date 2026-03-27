/* =============================================
   SAVOR RESTAURANT - Analytics
   Replace placeholder values below with your
   actual credentials before going to production.
   ============================================= */

// ─── Pendo (Guides & Surveys) ────────────────────────────────
(function(apiKey){
  (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
  v=['initialize','identify','updateOptions','pageLoad','track'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
  pendo.initialize({
    visitor: { id: 'VISITOR-UNIQUE-ID' },
    account: { id: 'ACCOUNT-UNIQUE-ID' }
  });
})('YOUR_PENDO_API_KEY');

// ─── FullStory ───────────────────────────────────────────────
window['_fs_debug'] = false;
window['_fs_host'] = 'fullstory.com';
window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
window['_fs_org'] = 'o-23A8EH-na1';
window['_fs_namespace'] = 'FS';
(function(m,n,e,t,l,o,g,y){
  if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].'); } return;}
  g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
  o=n.createElement(t);o.async=1;o.crossOrigin='anonymous';o.src='https://'+window['_fs_script'];
  y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
  g.identify=function(i,v,s){g(l,{uid:i},v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
  g.anonymize=function(){g.identify(!!0)};
  g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
  g.log = function(a,b){g("log",[a,b])};
  g.consent=function(a){g("consent",!arguments.length||a)};
  g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
  g.clearUserCookie=function(){};
  g.setVars=function(n, p){g('setVars',[n,p]);};
  g._w={};y='XMLHttpRequest';g._w[y]=m[y];y='fetch';g._w[y]=m[y];
  if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};
  g._v="1.3.0";
})(window,document,window['_fs_namespace'],'script','user');
