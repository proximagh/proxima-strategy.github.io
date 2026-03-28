(function() {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────
  var CFG = {
    uk:           { badge:'UK',          msg:"Hello! I'm Nova, Proxima's concierge. We're a UK-based enterprise architecture consultancy. How can I help?",          chips:['Our services','Connected Car','GCC Advisory','Contact us'] },
    europe:       { badge:'Europe',      msg:"Bonjour! I'm Nova. Proxima works with European automotive OEMs. What can I help you with?",                             chips:['Automotive OEM','EU AI Act','GDPR','Talk to team'] },
    'middle-east':{ badge:'Middle East', msg:"Ahlan! I'm Nova. Proxima specialises in Vision 2030 and GCC market entry. How can I help?",                            chips:['Vision 2030','GCC entry','PDPL','UAE advisory'] },
    na:           { badge:'N.America',   msg:"Hi! I'm Nova. Proxima supports connected vehicle programmes across NAR. What can I help with?",                        chips:['Connected vehicle','OEM integration','Data sovereignty','Schedule call'] },
    row:          { badge:'Global',      msg:"Hello! I'm Nova. Proxima delivers architecture advisory worldwide. Where are you based?",                               chips:['Global delivery','Our expertise','Partner with us','Contact us'] }
  };

  var KB = {
    services:   "Proxima has four practice areas:\n\n01 Connected Car Architecture\n02 GCC Market Advisory\n03 Fractional Architecture Leadership\n04 Programme Assurance\n\nWhich would you like to know more about?",
    car:        "Our Connected Car practice covers predictive maintenance, OTA updates, digital twin, in-vehicle services, and cross-market deployment across EMEA, NAR, China and Middle East.",
    gcc:        "GCC advisory: Vision 2030 alignment, Saudi PDPL compliance, UAE digital economy, sovereign cloud, Islamic finance technology, and market entry strategy.",
    leadership: "Fractional Architecture Leadership: embedded senior architect, ARB governance, decision register, stakeholder alignment. Available on day rate, retainer, or project basis.",
    assurance:  "Programme Assurance: GDPR, EU AI Act, PIPL, PDPL compliance. Delivery governance across complex multi-regional programmes.",
    team:       "Proxima was founded by:\n\nUmar Mohamed — Chief Technology Officer\nShahin Hassan — Chief Vision Officer\n\nBoth bring deep expertise in automotive and financial technology.",
    pricing:    "Proxima offers day rate, monthly retainer, or fixed project engagements. Would you like to discuss your specific needs?"
  };

  // ── State ────────────────────────────────────────────────────────────────
  var region = 'uk';
  var step = 'chat';
  var contact = {};
  var collectIdx = 0;
  var userInitials = 'U';
  var FIELDS = ['name','email','organisation','message'];
  var PROMPTS = ['What is your email?','Which organisation are you with?','What is your enquiry?'];

  // ── Create DOM ────────────────────────────────────────────────────────────
  function createNova() {
    // Launcher
    var btn = document.createElement('button');
    btn.id = 'nLauncher';
    btn.innerHTML = '<svg width="36" height="36" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="22" fill="#0d0f14"/><circle cx="22" cy="22" r="21" stroke="#c4973a" stroke-width="1.2"/><circle cx="18" cy="20" r="2.5" fill="#c4973a"/><circle cx="26" cy="20" r="2.5" fill="#c4973a"/><path d="M17 26 Q22 30 27 26" stroke="#c4973a" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg><div id="nDot" style="position:absolute;top:0;right:0;width:16px;height:16px;border-radius:50%;background:#e24b4a;border:2px solid #0d0f14;font-size:9px;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;">1</div>';
    btn.style.cssText = 'all:unset;position:fixed;bottom:24px;right:24px;z-index:2147483647;width:64px;height:64px;border-radius:50%;background:#0d0f14;border:2px solid #c4973a;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(196,151,58,0.4);';

    // Window
    var win = document.createElement('div');
    win.id = 'nWin';
    win.style.cssText = 'all:unset;position:fixed;bottom:100px;right:24px;z-index:2147483646;width:340px;height:520px;background:#0d0f14;border:1px solid rgba(196,151,58,0.3);border-radius:16px;display:none;flex-direction:column;overflow:hidden;font-family:Arial,sans-serif;box-shadow:0 16px 48px rgba(0,0,0,0.6);';

    win.innerHTML = [
      '<div style="background:#111827;padding:14px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(196,151,58,0.15);">',
        '<div style="width:40px;height:40px;border-radius:50%;background:#1a2a4a;border:1.5px solid #c4973a;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;">',
          '<svg width="24" height="24" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="20" fill="#0d0f14"/><circle cx="18" cy="20" r="2.5" fill="#c4973a"/><circle cx="26" cy="20" r="2.5" fill="#c4973a"/><path d="M17 26 Q22 30 27 26" stroke="#c4973a" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
          '<div style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#1d9e75;border:2px solid #111827;"></div>',
        '</div>',
        '<div style="flex:1;">',
          '<div style="color:#f7f8fa;font-size:15px;font-weight:600;">Nova</div>',
          '<div style="color:#1d9e75;font-size:10px;">Online — Proxima Concierge</div>',
        '</div>',
        '<span id="nBadge" style="font-size:10px;color:#8896ab;background:rgba(196,151,58,0.1);border:0.5px solid rgba(196,151,58,0.2);padding:3px 8px;border-radius:10px;">UK</span>',
        '<button id="nClose" style="all:unset;color:#4a5568;cursor:pointer;font-size:20px;padding:4px 8px;line-height:1;">&#10005;</button>',
      '</div>',
      '<div id="nMsgs" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;"></div>',
      '<div id="nChips" style="padding:6px 12px;display:flex;flex-wrap:wrap;gap:6px;"></div>',
      '<div style="padding:10px 12px;display:flex;gap:8px;align-items:center;border-top:1px solid rgba(196,151,58,0.1);">',
        '<textarea id="nInput" placeholder="Ask Nova anything..." rows="1" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(196,151,58,0.2);border-radius:20px;padding:9px 14px;color:#f7f8fa;font-size:16px;outline:none;resize:none;font-family:Arial,sans-serif;"></textarea>',
        '<button id="nSend" style="all:unset;width:38px;height:38px;border-radius:50%;background:#c4973a;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">',
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#000" stroke-width="2.5"><path d="M13 8H3M9 4l4 4-4 4"/></svg>',
        '</button>',
      '</div>'
    ].join('');

    document.body.appendChild(btn);
    document.body.appendChild(win);

    // ── Wire events ────────────────────────────────────────────────────────
    var isOpen = false;
    var msgs   = win.querySelector('#nMsgs');
    var chips  = win.querySelector('#nChips');
    var input  = win.querySelector('#nInput');
    var badge  = win.querySelector('#nBadge');
    var dot    = btn.querySelector('#nDot');
    var ready  = false;

    function open() {
      isOpen = true;
      win.style.display = 'flex';
      if (dot) dot.style.display = 'none';
      if (!ready) {
        ready = true;
        var cfg = CFG[region] || CFG.uk;
        setTimeout(function(){ addMsg('n', cfg.msg); }, 200);
        setTimeout(function(){ setChips(cfg.chips); }, 900);
      }
    }

    function close() {
      isOpen = false;
      win.style.display = 'none';
    }

    function addMsg(from, text) {
      var d = document.createElement('div');
      var isSelf = from === 'u';
      d.style.cssText = 'display:flex;gap:8px;align-items:flex-end;' + (isSelf ? 'flex-direction:row-reverse;' : '');
      var avatar = isSelf
        ? '<div style="width:28px;height:28px;border-radius:50%;background:rgba(196,151,58,0.2);border:1px solid rgba(196,151,58,0.4);display:flex;align-items:center;justify-content:center;font-size:11px;color:#c4973a;font-weight:700;flex-shrink:0;">' + userInitials + '</div>'
        : '<div style="width:28px;height:28px;border-radius:50%;background:#1a2a4a;border:1px solid rgba(196,151,58,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="20" fill="#0d0f14"/><circle cx="18" cy="20" r="2" fill="#c4973a"/><circle cx="26" cy="20" r="2" fill="#c4973a"/><path d="M17 26 Q22 30 27 26" stroke="#c4973a" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg></div>';
      var bubble = '<div style="max-width:80%;padding:9px 13px;border-radius:' + (isSelf ? '14px 14px 4px 14px' : '4px 14px 14px 14px') + ';background:' + (isSelf ? 'rgba(196,151,58,0.15)' : 'rgba(255,255,255,0.06)') + ';border:0.5px solid rgba(196,151,58,' + (isSelf ? '0.25' : '0.1') + ');color:#c4cdd9;font-size:13px;line-height:1.6;">' + String(text).replace(/\n/g,'<br>') + '</div>';
      d.innerHTML = avatar + bubble;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function setChips(list) {
      chips.innerHTML = '';
      (list||[]).forEach(function(t) {
        var b = document.createElement('button');
        b.textContent = t;
        b.style.cssText = 'all:unset;background:rgba(196,151,58,0.08);border:0.5px solid rgba(196,151,58,0.3);border-radius:14px;padding:6px 13px;font-size:11px;color:#c4973a;cursor:pointer;';
        b.addEventListener('click', function(){ chips.innerHTML=''; respond(t); });
        chips.appendChild(b);
      });
    }

    function respond(txt) {
      addMsg('u', txt);
      setChips([]);
      if (step === 'collect') { doCollect(txt); return; }
      var m = txt.toLowerCase();
      var ans;
      if (/service|offer|what do/.test(m))               ans = KB.services;
      else if (/car|vehicle|ota|predict|connect/.test(m)) ans = KB.car;
      else if (/gcc|saudi|uae|gulf|vision|pdpl/.test(m)) ans = KB.gcc;
      else if (/fraction|leader|cto|arb|retain/.test(m)) ans = KB.leadership;
      else if (/assur|gdpr|complian|ai act|pipl/.test(m)) ans = KB.assurance;
      else if (/team|umar|shahin|found|who/.test(m))      ans = KB.team;
      else if (/price|cost|rate|fee|budget/.test(m))      ans = KB.pricing;
      else if (/contact|touch|reach|call|book|meet/.test(m)) { setTimeout(startCollect, 400); return; }
      else ans = "Thanks for asking! Proxima specialises in enterprise architecture, connected car, and GCC advisory. Tell me more about your challenge?";
      setTimeout(function(){
        addMsg('n', ans);
        setTimeout(function(){ setChips(['Tell me more','Pricing','Meet the team','Contact Proxima']); }, 300);
      }, 600);
    }

    function startCollect() {
      step = 'collect'; contact = {}; collectIdx = 0;
      addMsg('n', "I will connect you with the Proxima team. What is your name?");
    }

    function doCollect(txt) {
      contact[FIELDS[collectIdx]] = txt;
      collectIdx++;
      if (collectIdx === 1) {
        userInitials = (txt.split(' ').map(function(w){ return w[0]||''; }).join('').slice(0,2)||'U').toUpperCase();
        setTimeout(function(){ addMsg('n', "Great to meet you " + txt.split(' ')[0] + "! " + PROMPTS[0]); }, 500);
      } else if (collectIdx < FIELDS.length) {
        setTimeout(function(){ addMsg('n', PROMPTS[collectIdx-1]); }, 500);
      } else {
        doSubmit();
      }
    }

    function doSubmit() {
      step = 'done';
      var first = (contact.name||'there').split(' ')[0];
      var reg = (CFG[region]||CFG.uk).badge;
      setTimeout(function(){
        addMsg('n', "Thank you " + first + "! Your details have been sent to the Proxima team. Someone will be in touch at " + (contact.email||'your email') + " within one business day.");
        setTimeout(function(){ setChips(['Our services','Connected Car','GCC Advisory']); }, 400);
        fetch('https://api.web3forms.com/submit', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            access_key:'1c41862c-09b4-45b9-b6ef-b87c0ec9a0d4',
            subject:'Nova enquiry — '+(contact.name||'visitor')+' ['+reg+']',
            name:contact.name||'', email:contact.email||'',
            message:'Org:'+(contact.organisation||'')+' | '+(contact.message||'')+' | Region:'+reg,
            from_name:'Nova — Proxima'
          })
        }).catch(function(){});
      }, 600);
    }

    // Button events
    btn.addEventListener('click', function(e){ e.stopPropagation(); isOpen ? close() : open(); });
    win.querySelector('#nClose').addEventListener('click', function(e){ e.stopPropagation(); close(); });
    win.querySelector('#nSend').addEventListener('click', function(e){
      e.stopPropagation();
      var t = input.value.trim();
      if (!t) return;
      input.value = '';
      respond(t);
    });
    input.addEventListener('keydown', function(e){
      if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); var t=input.value.trim(); if(!t)return; input.value=''; respond(t); }
    });

    // Region update hook
    window.novaSetRegion = function(r) {
      region = r;
      if (badge) badge.textContent = (CFG[r]||CFG.uk).badge;
    };

    console.log('[Nova] Ready');
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNova);
  } else {
    createNova();
  }

})();
