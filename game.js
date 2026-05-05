'use strict';

const Game = (() => {

    /* ════════════════════════════════════════════
       상태 초기값
    ════════════════════════════════════════════ */
    const newState = () => ({
        version: 1,
        tick: 0,
        day: 1,
        phase: 'intro',   // intro → early → mid → late

        hp:             100,
        maxHp:          100,
        flameEnergy:    0,
        maxFlameEnergy: 100,
        food:           5,
        money:          0,

        reputation: {
            vongola:    0,
            varia:      -20,
            millefiore: -50,
            kokuyo:     0
        },

        skills: {
            combat:  0,
            stealth: 0,
            nego:    0,
            flame:   0
        },

        flags: {
            awake: false
        },

        unlockedActions: []
    });

    let S = newState();

    /* ════════════════════════════════════════════
       행동 정의
    ════════════════════════════════════════════ */
    const ACTIONS = {
        explore: {
            label:    '주변 탐색',
            cooldown: 5000,
            unlock:   () => S.flags.awake,
            pool:     () => buildPool('explore'),
            onUse:    () => addLog('주변을 탐색한다...', 'system')
        },
        rest: {
            label:    '휴식하기',
            cooldown: 8000,
            unlock:   () => S.flags.awake,
            pool:     () => buildPool('rest'),
            onUse:    () => addLog('잠시 휴식을 취한다...', 'system')
        },
        train: {
            label:    '단련하기',
            cooldown: 10000,
            unlock:   () => S.tick >= 8 && S.flags.awake,
            pool:     () => buildPool('train'),
            onUse:    () => addLog('자신을 단련한다...', 'system')
        },
        scavenge: {
            label:    '자원 수집',
            cooldown: 12000,
            unlock:   () => S.tick >= 18 && S.flags.awake,
            pool:     () => buildPool('explore'),
            onUse:    () => {
                addLog('쓸 만한 물자를 찾아 헤맨다...', 'system');
                applyFx({ food: rnd(0, 2), money: rnd(0, 15) });
            }
        }
    };

    /* ════════════════════════════════════════════
       이벤트 풀 구성
    ════════════════════════════════════════════ */
    function buildPool(type) {
        const pool = [];

        function push(list) {
            list.forEach(ev => {
                if (ev.minTick && S.tick < ev.minTick) return;
                if (ev.conditions?.flags) {
                    for (const [k, v] of Object.entries(ev.conditions.flags)) {
                        if (S.flags[k] !== v) return;
                    }
                }
                for (let i = 0; i < (ev.weight || 5); i++) pool.push(ev);
            });
        }

        push(EVENTS[type] || []);

        if (type === 'explore') {
            if (S.tick >= 5)  push(EVENTS.guardians);
            if (S.tick >= 12) push(EVENTS.varia);
            if (S.tick >= 8)  push(EVENTS.millefiore.map(e => ({ ...e, weight: (e.weight || 5) + Math.floor(S.tick / 12) })));
            if (S.tick >= 18) push(EVENTS.kokuyo);
        }

        return pool;
    }

    /* ════════════════════════════════════════════
       이펙트 적용
    ════════════════════════════════════════════ */
    function applyFx(fx, silent = false) {
        if (!fx) return;
        const notes = [];

        if (fx.hp !== undefined) {
            S.hp = clamp(S.hp + fx.hp, 0, S.maxHp);
            if (!silent) notes.push(`HP ${fmt(fx.hp)}`);
        }
        if (fx.flameEnergy !== undefined) {
            S.flameEnergy = clamp(S.flameEnergy + fx.flameEnergy, 0, S.maxFlameEnergy);
            if (!silent) notes.push(`염력 ${fmt(fx.flameEnergy)}`);
        }
        if (fx.food !== undefined && fx.food !== 0) {
            S.food = Math.max(0, S.food + fx.food);
            if (!silent) notes.push(`식량 ${fmt(fx.food)}`);
        }
        if (fx.money !== undefined && fx.money !== 0) {
            S.money = Math.max(0, S.money + fx.money);
            if (!silent) notes.push(`돈 ${fmt(fx.money)}유로`);
        }
        if (fx.reputation) {
            for (const [f, v] of Object.entries(fx.reputation)) {
                S.reputation[f] = clamp((S.reputation[f] || 0) + v, -100, 100);
                if (!silent) notes.push(`${factionName(f)} ${fmt(v)}`);
            }
        }
        if (fx.skills) {
            for (const [sk, v] of Object.entries(fx.skills)) {
                S.skills[sk] = (S.skills[sk] || 0) + v;
                if (!silent) notes.push(`${skillName(sk)} +${v}`);
            }
        }

        if (notes.length && !silent) addLog('[ ' + notes.join(' / ') + ' ]', 'system');
        renderStats();
    }

    /* ════════════════════════════════════════════
       이벤트 모달
    ════════════════════════════════════════════ */
    function openModal(ev) {
        if (ev.id.startsWith('varia_'))       S.flags.metVaria = true;
        if (ev.id.startsWith('mille_'))       S.flags.metMillefiore = true;
        if (ev.id.startsWith('kokuyo_'))      S.flags.metKokuyo = true;

        el('modal-title').textContent = ev.title;
        el('modal-text').textContent  = ev.text;

        const optWrap = el('modal-options');
        optWrap.innerHTML = '';

        ev.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn' + (opt.isGameOver ? ' gameover-opt' : '');

            let locked = false;
            if (opt.requireSkill) {
                for (const [sk, min] of Object.entries(opt.requireSkill)) {
                    if ((S.skills[sk] || 0) < min) {
                        locked = true;
                        btn.title = `필요 스킬: ${skillName(sk)} ${min}`;
                    }
                }
            }

            btn.textContent = locked ? opt.text + `  [스킬 부족]` : opt.text;
            btn.disabled = locked;

            btn.addEventListener('click', () => {
                closeModal();
                resolveOption(opt);
            });
            optWrap.appendChild(btn);
        });

        el('event-modal').classList.remove('hidden');
    }

    function closeModal() {
        el('event-modal').classList.add('hidden');
    }

    function resolveOption(opt) {
        if (opt.outcome) addLog(opt.outcome, opt.isGameOver ? 'combat' : 'event');
        if (opt.isGameOver) { triggerGameOver(opt.outcome); return; }
        applyFx(opt.effects);
        checkHazards();
    }

    /* ════════════════════════════════════════════
       게임 오버
    ════════════════════════════════════════════ */
    function triggerGameOver(reason) {
        disableActions();
        autosaveClear();

        setTimeout(() => {
            const ov = document.createElement('div');
            ov.id = 'gameover-overlay';
            ov.innerHTML = `
                <h2>G A M E &nbsp; O V E R</h2>
                <p>${reason || '이 세계에서 이름 없이 사라졌다.'}<br><br>Day ${S.day} &mdash; Tick ${S.tick}</p>
                <button id="go-restart">처음부터</button>
            `;
            document.body.appendChild(ov);
            el('go-restart').addEventListener('click', resetGame);
        }, 800);
    }

    function checkHazards() {
        if (S.hp <= 0) {
            triggerGameOver('체력이 다했다. 전쟁 속에 쓰러졌다.');
        }
    }

    /* ════════════════════════════════════════════
       틱 & 주기적 효과
    ════════════════════════════════════════════ */
    function tick() {
        S.tick++;

        // 하루 경과
        if (S.tick % 10 === 0) {
            S.day++;
            el('game-time').textContent = `Day ${S.day}`;
            addLog(`─── Day ${S.day} ───`, 'system');
        }

        // 식량 소비 (6틱마다)
        if (S.tick % 6 === 0 && S.tick > 0) {
            if (S.food > 0) {
                applyFx({ food: -1 }, true);
                addLog('식량을 소비했다.', 'system');
            } else {
                applyFx({ hp: -8 }, true);
                addLog('굶주리고 있다. HP -8', 'warning');
            }
        }

        // 밀피오레 적대 세력 — 평판이 너무 낮으면 자동 HP 피해
        if (S.tick % 15 === 0 && S.reputation.millefiore < -70) {
            applyFx({ hp: -5 }, true);
            addLog('밀피오레의 압박이 계속되고 있다. HP -5', 'combat');
        }

        // 본고레 우호 — 평판이 높으면 소량 회복
        if (S.tick % 20 === 0 && S.reputation.vongola >= 40) {
            applyFx({ hp: 5 }, true);
            addLog('본고레 조직원이 몰래 식량을 놓고 갔다. HP +5', 'success');
        }

        // 페이즈 전환
        if (S.tick >= 50 && S.phase === 'early') { S.phase = 'mid';  addLog('상황이 점점 불안해지고 있다.', 'warning'); }
        if (S.tick >= 100 && S.phase === 'mid')  { S.phase = 'late'; addLog('전쟁이 최고조에 달하고 있다.', 'combat'); }

        checkUnlocks();
        checkHazards();
        autosave();
    }

    /* ════════════════════════════════════════════
       행동 버튼 잠금 해제
    ════════════════════════════════════════════ */
    function checkUnlocks() {
        Object.entries(ACTIONS).forEach(([id, act]) => {
            if (!S.unlockedActions.includes(id) && act.unlock()) {
                S.unlockedActions.push(id);
                addLog(`새 행동이 가능해졌다: [${act.label}]`, 'success');
                renderButtons();
            }
        });
    }

    /* ════════════════════════════════════════════
       행동 버튼 렌더링
    ════════════════════════════════════════════ */
    function renderButtons() {
        const wrap = el('action-buttons');
        wrap.innerHTML = '';

        S.unlockedActions.forEach(id => {
            const act = ACTIONS[id];
            if (!act) return;

            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.id = `btn-${id}`;

            const lbl = document.createElement('span');
            lbl.textContent = act.label;

            const cd = document.createElement('div');
            cd.className = 'cd-bar';

            btn.appendChild(lbl);
            btn.appendChild(cd);

            btn.addEventListener('click', () => doAction(id, btn, cd));
            wrap.appendChild(btn);
        });
    }

    function doAction(id, btn, cdBar) {
        const act = ACTIONS[id];
        if (!act || btn.disabled) return;

        btn.disabled = true;
        act.onUse();

        const pool = act.pool();
        const picked = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
        if (picked) setTimeout(() => openModal(picked), 300);

        startCooldown(btn, cdBar, act.cooldown);
        tick();
    }

    function startCooldown(btn, cdBar, duration) {
        const start = Date.now();
        const id = setInterval(() => {
            const pct = Math.min(100, ((Date.now() - start) / duration) * 100);
            cdBar.style.width = pct + '%';
            if (pct >= 100) {
                clearInterval(id);
                cdBar.style.width = '0%';
                btn.disabled = false;
            }
        }, 60);
    }

    function disableActions() {
        document.querySelectorAll('.action-btn').forEach(b => { b.disabled = true; });
    }

    /* ════════════════════════════════════════════
       통계 렌더링
    ════════════════════════════════════════════ */
    function renderStats() {
        const hpPct = (S.hp / S.maxHp) * 100;
        const hpBar = el('hp-bar');
        hpBar.style.width = hpPct + '%';
        hpBar.style.background = hpPct < 25 ? 'var(--red)' : hpPct < 50 ? '#c8a030' : 'var(--green)';
        el('hp-val').textContent = `${S.hp}/${S.maxHp}`;

        el('flame-bar').style.width = (S.flameEnergy / S.maxFlameEnergy * 100) + '%';
        el('flame-val').textContent = `${S.flameEnergy}/${S.maxFlameEnergy}`;

        el('food-val').textContent  = S.food;
        el('money-val').textContent = `${S.money} 유로`;

        el('sk-combat').textContent  = S.skills.combat  || 0;
        el('sk-stealth').textContent = S.skills.stealth || 0;
        el('sk-nego').textContent    = S.skills.nego    || 0;
        el('sk-flame').textContent   = S.skills.flame   || 0;

        renderRepBars();
    }

    const REP_COLORS = {
        vongola: 'var(--c-vongola)',
        varia:   'var(--c-varia)',
        millefiore: 'var(--c-mille)',
        kokuyo:  'var(--c-kokuyo)'
    };

    function renderRepBars() {
        ['vongola', 'varia', 'millefiore', 'kokuyo'].forEach(f => {
            const bar = el(`rep-${f}`);
            if (!bar) return;
            const v = S.reputation[f] || 0;
            if (v >= 0) {
                bar.style.left       = '50%';
                bar.style.width      = (v / 2) + '%';
                bar.style.background = REP_COLORS[f];
            } else {
                const w = Math.abs(v) / 2;
                bar.style.left       = (50 - w) + '%';
                bar.style.width      = w + '%';
                bar.style.background = 'var(--red)';
            }
        });
    }

    /* ════════════════════════════════════════════
       로그
    ════════════════════════════════════════════ */
    function addLog(text, type = '') {
        const wrap = el('log-content');
        if (!text) {
            const blank = document.createElement('div');
            blank.className = 'log-entry empty';
            wrap.appendChild(blank);
            return;
        }
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.textContent = text;
        wrap.appendChild(div);
        wrap.scrollTop = wrap.scrollHeight;
        while (wrap.children.length > 250) wrap.removeChild(wrap.firstChild);
    }

    /* ════════════════════════════════════════════
       인트로 시퀀스
    ════════════════════════════════════════════ */
    function playIntro() {
        const lines = [
            [800,  '...', ''],
            [1400, '눈이 떠진다.', ''],
            [500,  '', ''],
            [1200, '차갑다.', ''],
            [1800, '석조 바닥. 높은 천장. 고딕 양식의 창문으로 쏟아지는 빛.', ''],
            [400,  '', ''],
            [1500, '여기가... 어디지?', ''],
            [400,  '', ''],
            [1600, '멀리서 총성이 들린다.', 'warning'],
            [1400, '그리고 어딘가에서 폭발음.', 'warning'],
            [600,  '', ''],
            [2200, '벽에 새겨진 문양 ─ 모시조개. 본고레 패밀리의 상징이다.', ''],
            [400,  '', ''],
            [2000, '설마... 가정교사 히트맨 리본의 세계?', ''],
            [1800, '그것도 미래 편. 밀피오레가 판치는 가장 위험한 시기.', 'warning'],
            [600,  '', ''],
            [2200, '일단 살아남아야 한다.', 'success'],
            [1000, '', ''],
        ];

        let delay = 0;
        lines.forEach(([d, text, type]) => {
            delay += d;
            setTimeout(() => addLog(text, type), delay);
        });

        setTimeout(() => {
            S.flags.awake = true;
            S.phase = 'early';
            checkUnlocks();
            addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'system');
        }, delay + 400);
    }

    /* ════════════════════════════════════════════
       저장 / 불러오기 / 초기화
    ════════════════════════════════════════════ */
    const SAVE_KEY  = 'bongore_save';
    const AUTO_KEY  = 'bongore_auto';

    function saveGame() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(S));
            toast('저장됐다.');
        } catch { toast('저장 실패.', true); }
    }

    function loadGame(key = SAVE_KEY, silent = false) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) { if (!silent) toast('세이브 파일 없음.', true); return false; }
            S = JSON.parse(raw);
            renderStats();
            renderButtons();
            if (!silent) { addLog('세이브 파일을 불러왔다.', 'success'); toast('불러오기 완료.'); }
            return true;
        } catch { if (!silent) toast('불러오기 실패.', true); return false; }
    }

    function autosave() {
        if (S.tick % 5 === 0) {
            try { localStorage.setItem(AUTO_KEY, JSON.stringify(S)); } catch {}
        }
    }

    function autosaveClear() {
        localStorage.removeItem(AUTO_KEY);
    }

    function resetGame() {
        const ov = document.getElementById('gameover-overlay');
        if (ov) ov.remove();

        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(AUTO_KEY);

        S = newState();
        el('log-content').innerHTML = '';
        el('action-buttons').innerHTML = '';
        el('game-time').textContent = 'Day 1';
        renderStats();
        playIntro();
    }

    /* ════════════════════════════════════════════
       토스트
    ════════════════════════════════════════════ */
    function toast(msg, err = false) {
        const t = document.createElement('div');
        t.className = 'toast' + (err ? ' err' : '');
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3100);
    }

    /* ════════════════════════════════════════════
       유틸리티
    ════════════════════════════════════════════ */
    const el      = id => document.getElementById(id);
    const clamp   = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const rnd     = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
    const fmt     = v => (v > 0 ? '+' : '') + v;

    const FACTION_NAMES = { vongola: '본고레', varia: '바리아', millefiore: '밀피오레', kokuyo: '고쿠요' };
    const SKILL_NAMES   = { combat: '전투', stealth: '은신', nego: '교섭', flame: '화염' };
    const factionName   = k => FACTION_NAMES[k] || k;
    const skillName     = k => SKILL_NAMES[k]   || k;

    /* ════════════════════════════════════════════
       초기화
    ════════════════════════════════════════════ */
    function init() {
        renderStats();

        el('save-btn').addEventListener('click', saveGame);
        el('load-btn').addEventListener('click', () => loadGame());
        el('reset-btn').addEventListener('click', () => {
            if (confirm('처음부터 다시 시작하겠습니까?\n현재 진행 상황이 사라집니다.')) resetGame();
        });

        // 자동 저장 복구 시도
        const hasAuto = localStorage.getItem(AUTO_KEY);
        if (hasAuto) {
            const resume = confirm('이전 자동 저장 데이터가 있습니다.\n이어서 하시겠습니까?');
            if (resume) { loadGame(AUTO_KEY, true); addLog('자동 저장에서 이어합니다.', 'success'); return; }
        }

        playIntro();
    }

    return { init };

})();

document.addEventListener('DOMContentLoaded', () => Game.init());
