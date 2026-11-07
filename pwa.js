/* MILO CASHIER: native browser PWA install (Chrome / Edge).
   No automatic installation; browser decides when to offer the native prompt. */
(() => {
  let deferredPrompt = null;
  const buttons = [document.getElementById('installAppButton'), document.getElementById('installAppLoginButton')].filter(Boolean);
  const loginPanel = document.getElementById('miloInstallLogin');
  const installed = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  function updateUI() {
    const done = installed();
    buttons.forEach(btn => {btn.hidden=done; btn.disabled=done;});
    if(loginPanel) loginPanel.hidden=done;
    document.body.dataset.canInstall=done?'0':'1';
  }
  function help(message) {
    const heading = 'تثبيت ميلو كاشير على الجهاز';
    if(typeof window.showModal === 'function' && typeof window.closeModal === 'function') {
      window.showModal(heading, '<div class="stack"><p>'+message+'</p></div>', [{label:'إغلاق',onClick:window.closeModal}]);
    } else {
      const el=document.createElement('div');el.innerHTML=message;
      alert(heading+'\n\n'+el.textContent);
    }
  }
  window.miloInstallApp = async function(){
    if(installed()){help('كاشير ميلو مثبت على جهازك ويعمل في نافذة مستقلة.');return;}
    if(!window.isSecureContext || location.protocol==='file:'){
      help('افتح رابط موقع ميلو المنشور على GitHub Pages باستخدام HTTPS في Google Chrome أو Microsoft Edge. لا يمكن تثبيت التطبيق من ملف HTML محلي.');return;
    }
    if(deferredPrompt){
      const event=deferredPrompt;deferredPrompt=null;
      try {
        await event.prompt();
        const choice=await event.userChoice;
        if(choice && choice.outcome==='accepted'){ updateUI();return; }
      } catch(err) {console.warn('MILO install:',err);}
    }
    help('المتصفح لم يوفّر نافذة التثبيت التلقائي لهذه الصفحة حاليًا.<br><b>Microsoft Edge:</b> القائمة (…) ← التطبيقات ← تثبيت هذا الموقع كتطبيق.<br><b>Google Chrome:</b> اضغط أيقونة تثبيت التطبيق بجانب عنوان الموقع، أو القائمة (…) ← البث والحفظ والمشاركة ← تثبيت الصفحة كتطبيق (قد يختلف الاسم حسب الإصدار).<br>بعد التثبيت اختر إنشاء اختصار على سطح المكتب عند توفر الخيار.');
  };
  window.addEventListener('beforeinstallprompt', e=>{e.preventDefault();deferredPrompt=e;updateUI();});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;updateUI();});
  buttons.forEach(btn=>btn.addEventListener('click',window.miloInstallApp));
  if('serviceWorker' in navigator && (location.protocol==='https:' || ['localhost','127.0.0.1'].includes(location.hostname))){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=18',{updateViaCache:'none'}).catch(e=>console.warn('MILO SW:',e)));
  }
  updateUI();
})();
