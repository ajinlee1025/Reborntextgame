/**
 * events.js
 *
 * 모든 이벤트 데이터. 확장 시 이 파일에 항목을 추가하면 됩니다.
 *
 * 이벤트 구조:
 * {
 *   id        : string  (고유 식별자)
 *   title     : string  (모달 제목)
 *   text      : string  (본문. \n으로 줄바꿈)
 *   weight    : number  (등장 가중치 — 높을수록 자주 등장)
 *   minTick   : number  (최소 틱 조건, optional)
 *   conditions: {       (optional)
 *     flags : { flagName: boolean, ... }
 *   }
 *   options   : [
 *     {
 *       text           : string   (버튼 텍스트)
 *       effects        : Effects  (아래 참조)
 *       outcome        : string   (선택 결과 로그)
 *       isGameOver     : boolean  (optional)
 *       requireSkill   : { skillKey: minValue } (optional, 부족 시 비활성)
 *     }
 *   ]
 * }
 *
 * Effects 구조:
 * {
 *   hp          : number,
 *   flameEnergy : number,
 *   food        : number,
 *   money       : number,
 *   reputation  : { vongola|varia|millefiore|kokuyo : number },
 *   skills      : { combat|stealth|nego|flame : number }
 * }
 */

const EVENTS = {

    /* ────────────────────────────────────────────
       탐색 이벤트 (explore 액션 풀)
    ──────────────────────────────────────────── */
    explore: [
        {
            id: 'empty_corridor',
            title: '텅 빈 복도',
            text: '긴 석조 복도를 걷는다. 낡은 촛대와 먼지 쌓인 갑옷들이 줄지어 서 있다.\n발소리만 메아리쳐 돌아온다.',
            weight: 15,
            options: [
                {
                    text: '계속 걷는다',
                    effects: {},
                    outcome: '특별한 수확 없이 돌아왔다.'
                },
                {
                    text: '촛대 주변을 뒤진다',
                    effects: { money: 5 },
                    outcome: '동전 몇 개를 발견했다. +5유로.'
                }
            ]
        },
        {
            id: 'storage_room',
            title: '열린 창고',
            text: '잠겨 있을 것 같았던 문이 살짝 열려 있다. 안에는 본고레 문양이 찍힌 물자들이 가득하다.',
            weight: 10,
            options: [
                {
                    text: '식량을 가져간다',
                    effects: { food: 8, reputation: { vongola: -3 } },
                    outcome: '식량 8개를 챙겼다. 누군가 봤을지도 모른다. 본고레 평판 -3.'
                },
                {
                    text: '팔 만한 물건을 찾는다',
                    effects: { money: 20 },
                    outcome: '작은 금속 부품을 찾았다. 20유로 정도 될 것 같다.'
                },
                {
                    text: '손대지 않는다',
                    effects: { reputation: { vongola: 2 } },
                    outcome: '마침 지나가던 본고레 조직원이 고개를 끄덕였다. 평판 +2.'
                }
            ]
        },
        {
            id: 'vongola_patrol',
            title: '순찰 중인 조직원',
            text: '본고레 마크가 새겨진 재킷의 조직원과 눈이 마주쳤다.\n그는 경계하는 눈빛으로 너를 훑어본다.',
            weight: 12,
            options: [
                {
                    text: '"저는 위험한 사람이 아니에요."',
                    effects: { reputation: { vongola: 5 } },
                    outcome: '조직원이 잠시 의심하다 그냥 지나쳤다. 본고레 평판 +5.'
                },
                {
                    text: '황급히 도망친다',
                    effects: { hp: -5, reputation: { vongola: -5 } },
                    outcome: '허둥지둥 피하다 벽에 부딪혔다. HP -5, 수상한 인물로 등록된 것 같다.'
                },
                {
                    text: '무시하고 지나친다',
                    effects: {},
                    outcome: '서로 무시한 채 지나쳤다.'
                }
            ]
        },
        {
            id: 'hidden_food',
            title: '숨겨진 식량',
            text: '벽 틈새에 천으로 감싼 빵과 물병이 숨겨져 있다.\n누군가 비상용으로 놓아둔 것 같다.',
            weight: 8,
            options: [
                {
                    text: '가져간다',
                    effects: { food: 5, hp: 10 },
                    outcome: '허기진 배를 채웠다. 식량 +5, HP +10.'
                },
                {
                    text: '내버려 둔다',
                    effects: {},
                    outcome: '다른 누군가에게 더 필요할지 모른다.'
                }
            ]
        },
        {
            id: 'injured_vongola',
            title: '부상당한 조직원',
            text: '복도 구석에 하급 본고레 조직원이 쓰러져 있다.\n밀피오레와 교전 중 다친 것 같다. 피가 흐르고 있다.',
            weight: 7,
            options: [
                {
                    text: '응급처치를 해준다',
                    effects: { food: -2, reputation: { vongola: 15 } },
                    outcome: '식량을 나눠주고 상처를 처치했다. 조직원이 감사를 표했다. 본고레 평판 +15.'
                },
                {
                    text: '모른 척 지나친다',
                    effects: { reputation: { vongola: -2 } },
                    outcome: '찜찜한 마음으로 지나쳤다.'
                },
                {
                    text: '소지품을 뒤진다',
                    effects: { money: 30, reputation: { vongola: -20 } },
                    outcome: '30유로를 얻었다. 조직원의 원망 어린 눈빛이 뇌리에 박힌다. 본고레 평판 -20.'
                }
            ]
        },
        {
            id: 'flame_residue',
            title: '화염의 잔흔',
            text: '복도 끝에서 불에 탄 흔적을 발견했다. 강렬한 화염이 지나간 자국이다.\n손가락 끝에서 희미하게 뭔가 느껴지는 것 같기도 하다.',
            weight: 6,
            minTick: 5,
            options: [
                {
                    text: '잔흔을 만져본다',
                    effects: { flameEnergy: 8 },
                    outcome: '잠든 무언가가 반응한다. 염력 +8.'
                },
                {
                    text: '그냥 지나친다',
                    effects: {},
                    outcome: '위험할지 모른다는 생각에 지나쳤다.'
                }
            ]
        },
        {
            id: 'vongola_ring_fragment',
            title: '이상한 링 조각',
            text: '바닥에 떨어진 금속 파편을 발견했다.\n본고레 링의 파편 같다. 이런 것을 들고 있으면 위험할 수도 있다.',
            weight: 3,
            minTick: 15,
            options: [
                {
                    text: '챙긴다',
                    effects: { flameEnergy: 20, reputation: { vongola: 5 } },
                    outcome: '링 파편을 주웠다. 손에서 열기가 느껴진다. 염력 +20, 본고레 평판 +5.'
                },
                {
                    text: '본고레에 가져다준다',
                    effects: { reputation: { vongola: 25 } },
                    outcome: '조직원이 크게 놀라며 감사를 전했다. 본고레 평판 +25.'
                },
                {
                    text: '내버려 둔다',
                    effects: {},
                    outcome: '모른 척하고 지나쳤다.'
                }
            ]
        }
    ],

    /* ────────────────────────────────────────────
       휴식 이벤트 (rest 액션 풀)
    ──────────────────────────────────────────── */
    rest: [
        {
            id: 'peaceful_sleep',
            title: '잠시 휴식',
            text: '안전한 구석을 찾아 눈을 붙인다.\n잠결에도 먼 곳에서 총성이 들리는 것 같다.',
            weight: 15,
            options: [
                {
                    text: '일어선다',
                    effects: { hp: 20 },
                    outcome: '몸이 조금 회복됐다. HP +20.'
                }
            ]
        },
        {
            id: 'nightmare',
            title: '악몽',
            text: '잠에 들었지만 전투의 굉음과 비명이 꿈을 가득 채웠다.\n이것이 미래의 현실인가.',
            weight: 8,
            options: [
                {
                    text: '떨쳐내고 일어선다',
                    effects: { hp: 8, flameEnergy: -5 },
                    outcome: '불안한 잠자리였다. HP +8 (부분 회복), 염력 -5.'
                }
            ]
        },
        {
            id: 'dream_reborn',
            title: '꿈 속의 아기',
            text: '꿈 속에서 검은 정장을 입은 아기가 나타났다. 어딘가 낯이 익다.\n"아직 쓸 만한 화염을 갖고 있지 않아. 더 단련해라."',
            weight: 4,
            minTick: 10,
            options: [
                {
                    text: '꿈에서 깨어난다',
                    effects: { hp: 15, flameEnergy: 10, skills: { flame: 1 } },
                    outcome: '알 수 없는 의지가 솟았다. HP +15, 염력 +10, 화염 스킬 +1.'
                }
            ]
        },
        {
            id: 'interrupted_sleep',
            title: '잠을 방해받다',
            text: '막 잠들려는 순간, 복도에서 전투 소리가 들려온다.\n가만히 있어야 하나, 피해야 하나.',
            weight: 7,
            options: [
                {
                    text: '더 안쪽으로 숨는다',
                    effects: { hp: 5 },
                    outcome: '소리가 멀어졌다. 거의 못 쉬었지만 살았다. HP +5.'
                },
                {
                    text: '무슨 일인지 확인한다',
                    effects: { hp: -10, reputation: { vongola: 8 } },
                    outcome: '밀피오레와 교전 중인 본고레 조직원을 도왔다. HP -10, 본고레 평판 +8.'
                }
            ]
        }
    ],

    /* ────────────────────────────────────────────
       훈련 이벤트 (train 액션 풀)
    ──────────────────────────────────────────── */
    train: [
        {
            id: 'body_training',
            title: '체력 단련',
            text: '몸을 혹독하게 단련했다. 근육이 타들어 가는 것 같지만\n이 세계에서 살아남으려면 더 강해져야 한다.',
            weight: 12,
            options: [
                {
                    text: '계속한다',
                    effects: { hp: -10, skills: { combat: 1 } },
                    outcome: '전투 스킬이 조금 향상됐다. 전투 +1 / HP -10.'
                },
                {
                    text: '적당히 마무리한다',
                    effects: { hp: -3 },
                    outcome: '체력을 아꼈다. HP -3.'
                }
            ]
        },
        {
            id: 'flame_meditation',
            title: '화염 명상',
            text: '조용한 곳에서 내면의 화염을 느끼려 집중한다.\n미미하지만, 무언가 뜨거운 것이 느껴진다.',
            weight: 10,
            options: [
                {
                    text: '집중을 유지한다',
                    effects: { hp: -5, flameEnergy: 15, skills: { flame: 1 } },
                    outcome: '필살염 에너지가 충전됐다. 염력 +15, 화염 +1 / HP -5.'
                },
                {
                    text: '너무 이르다고 생각해 멈춘다',
                    effects: { hp: 5 },
                    outcome: '아직 때가 아닌 것 같다. HP +5.'
                }
            ]
        },
        {
            id: 'stealth_practice',
            title: '은신 연습',
            text: '적들 눈을 피해 이동하는 법을 연습한다.\n발소리를 죽이고, 그림자 속에 녹아드는 감각.',
            weight: 8,
            options: [
                {
                    text: '집중해서 연습한다',
                    effects: { hp: -5, skills: { stealth: 1 } },
                    outcome: '은신 스킬이 향상됐다. 은신 +1 / HP -5.'
                }
            ]
        },
        {
            id: 'negotiation_study',
            title: '협상 공부',
            text: '조직의 역학과 각 세력의 관계를 분석하고,\n어떻게 이들과 말을 섞을지 고민했다.',
            weight: 6,
            options: [
                {
                    text: '계속 생각한다',
                    effects: { skills: { nego: 1 } },
                    outcome: '교섭 스킬이 향상됐다. 교섭 +1.'
                }
            ]
        }
    ],

    /* ────────────────────────────────────────────
       바리아 이벤트 (탐색 중 랜덤 등장)
    ──────────────────────────────────────────── */
    varia: [
        {
            id: 'varia_levi',
            title: '바리아 ─ 레비 아 탄',
            text: '거대한 체구에 피뢰침 왕관을 쓴 남자가 나타났다.\n"밀피오레 첩자냐? 목숨이 아까우면 썩 사라져."',
            weight: 6,
            options: [
                {
                    text: '"저는 첩자가 아니에요."',
                    effects: { reputation: { varia: 5 } },
                    outcome: '레비가 코웃음 치며 지나쳤다. 일단 살았다. 바리아 평판 +5.'
                },
                {
                    text: '무기를 든 척 허세를 부린다',
                    effects: { hp: -25, reputation: { varia: -10 } },
                    outcome: '레비가 피뢰침 전격을 날렸다. 가까스로 피했지만 HP -25, 바리아 평판 -10.'
                },
                {
                    text: '납작 엎드려 빈다',
                    effects: { reputation: { varia: -3 } },
                    outcome: '"쓸모없는 놈." 레비가 지나쳤다. 굴욕적이지만 살았다.'
                }
            ]
        },
        {
            id: 'varia_squalo',
            title: '바리아 ─ 스페르비 스쿠알로',
            text: '"VOOOIIII!"\n은발의 검사가 검을 겨누며 나타났다. 바리아 검술 대장, 스쿠알로.',
            weight: 3,
            options: [
                {
                    text: '정면으로 맞선다',
                    effects: { hp: -40, reputation: { varia: 20 } },
                    requireSkill: { combat: 3 },
                    outcome: '처절하게 싸웠다. "다음엔 더 강해져서 와라." 스쿠알로가 떠났다. HP -40, 바리아 평판 +20.'
                },
                {
                    text: '검을 피해 도망친다',
                    effects: { hp: -15, reputation: { varia: -5 } },
                    outcome: '검이 외투를 스쳐 지나갔다. 간신히 도망쳤다. HP -15.'
                },
                {
                    text: '"10대 보스와 안면이 있어요."',
                    effects: { reputation: { varia: 8 } },
                    requireSkill: { nego: 2 },
                    outcome: '스쿠알로가 의심스럽게 보다 천천히 검을 거뒀다.'
                }
            ]
        },
        {
            id: 'varia_xanxus',
            title: '바리아 ─ 잔저스',
            text: '뜨거운 기운이 복도를 뒤덮는다. 먼 끝에서 불꽃이 타오르고 있다.\n"... 누구냐."',
            weight: 1,
            minTick: 30,
            options: [
                {
                    text: '"저는 그냥 지나가는 사람입니다."',
                    effects: { reputation: { varia: 5 } },
                    outcome: '잔저스가 코웃음 치며 시선을 돌렸다. "시시하군." 살았다.'
                },
                {
                    text: '달아난다',
                    effects: { hp: -20 },
                    outcome: '불꽃이 뒤를 스쳤다. 간신히 벗어났다. HP -20.'
                },
                {
                    text: '그냥 서 있는다',
                    effects: { hp: -999 },
                    isGameOver: true,
                    outcome: '잔저스의 불꽃이 덮쳤다. 피할 틈조차 없었다.'
                }
            ]
        }
    ],

    /* ────────────────────────────────────────────
       밀피오레 이벤트 (탐색 중 랜덤 등장, 점차 증가)
    ──────────────────────────────────────────── */
    millefiore: [
        {
            id: 'mille_patrol',
            title: '밀피오레 순찰대',
            text: '흑화 패밀리 문양의 전투원들이 복도를 가득 채웠다.\n"본고레 잔당을 전원 처리하라."',
            weight: 8,
            options: [
                {
                    text: '숨는다',
                    effects: { hp: -5, skills: { stealth: 1 } },
                    requireSkill: { stealth: 2 },
                    outcome: '숨어서 위기를 넘겼다. HP -5, 은신 +1.'
                },
                {
                    text: '싸운다',
                    effects: { hp: -35, reputation: { millefiore: -10, vongola: 10 } },
                    outcome: '처절하게 싸워 한 명을 쓰러트렸다. HP -35. 본고레가 멀리서 봤다.'
                },
                {
                    text: '"본고레랑 관계없어요!"',
                    effects: { hp: -10, reputation: { millefiore: 5 } },
                    outcome: '반신반의하며 일단 내버려뒀다. HP -10.'
                }
            ]
        },
        {
            id: 'mille_spy',
            title: '밀피오레 첩자',
            text: '음식을 먹으며 쉬고 있을 때 수상한 인물을 발견했다.\n밀피오레 첩자 같다. 아직 너를 보지 못했다.',
            weight: 6,
            options: [
                {
                    text: '본고레에 신고한다',
                    effects: { reputation: { vongola: 20, millefiore: -15 } },
                    outcome: '본고레 조직원들이 즉시 첩자를 제압했다. 본고레 평판 +20.'
                },
                {
                    text: '모른 척한다',
                    effects: {},
                    outcome: '그냥 지나쳤다.'
                },
                {
                    text: '접근해 정보를 캔다',
                    effects: { money: 50, reputation: { millefiore: 5 } },
                    requireSkill: { nego: 2 },
                    outcome: '첩자인 척 접근해 정보를 팔아 50유로를 얻었다. 위험한 선택이었다.'
                }
            ]
        },
        {
            id: 'mille_byakuran_vision',
            title: '환영',
            text: '갑자기 시야가 희게 번진다. 흰 머리카락에 미소 짓는 청년.\n"흐음, 재밌는 존재네. 이 시간축에서 살아남아 봐."\n그리고 환영은 사라졌다.',
            weight: 1,
            minTick: 40,
            options: [
                {
                    text: '...',
                    effects: { flameEnergy: 20, hp: -5 },
                    outcome: '불안하다. 하지만 무언가가 각성한 것 같기도 하다. 염력 +20, HP -5.'
                }
            ]
        }
    ],

    /* ────────────────────────────────────────────
       고쿠요 이벤트 (탐색 중 랜덤 등장)
    ──────────────────────────────────────────── */
    kokuyo: [
        {
            id: 'kokuyo_ken',
            title: '고쿠요 ─ 켄',
            text: '"으르르... 냄새가 나." 날카로운 이빨을 드러낸 소년이 앞을 막아선다.\n고쿠요 갱의 켄이다.',
            weight: 5,
            options: [
                {
                    text: '식량을 던져준다',
                    effects: { food: -3, reputation: { kokuyo: 10 } },
                    outcome: '켄이 음식에 관심을 보이며 비켜줬다. 식량 -3, 고쿠요 평판 +10.'
                },
                {
                    text: '싸운다',
                    effects: { hp: -25, reputation: { kokuyo: -10 } },
                    outcome: '켄의 야성에 처참히 얻어맞았다. HP -25.'
                },
                {
                    text: '"크롬을 알아?"',
                    effects: { reputation: { kokuyo: 15 } },
                    requireSkill: { nego: 1 },
                    outcome: '켄이 경계를 낮추며 수상쩍게 보다 지나쳤다. 고쿠요 평판 +15.'
                }
            ]
        },
        {
            id: 'kokuyo_chikusa',
            title: '고쿠요 ─ 치쿠사',
            text: '조용한 발소리도 없이 안경을 쓴 냉정한 눈빛의 소년이 나타났다.\n치쿠사. 바늘 요요를 만지작거리고 있다.',
            weight: 4,
            options: [
                {
                    text: '조용히 대화를 시도한다',
                    effects: { reputation: { kokuyo: 10 } },
                    requireSkill: { nego: 2 },
                    outcome: '치쿠사가 말 없이 고개를 끄덕이고 지나쳤다. 고쿠요 평판 +10.'
                },
                {
                    text: '달아난다',
                    effects: { hp: -15 },
                    outcome: '바늘이 어깨를 스쳤다. HP -15.'
                }
            ]
        },
        {
            id: 'kokuyo_mukuro',
            title: '고쿠요 ─ 로쿠도 무쿠로',
            text: '아무도 없었는데, 어느새 유리알 같은 눈동자가 앞에 있다.\n로쿠도 무쿠로. 천천히 미소 짓는다.\n"흥미롭군. 이 시공간에 어울리지 않는 냄새가 나."',
            weight: 2,
            minTick: 20,
            options: [
                {
                    text: '솔직하게 상황을 설명한다',
                    effects: { reputation: { kokuyo: 25 } },
                    outcome: '"재미있는 패군요." 무쿠로가 사라진 자리에 이상하게 안도감이 남는다. 고쿠요 평판 +25.'
                },
                {
                    text: '입을 다문다',
                    effects: { hp: -10 },
                    outcome: '무쿠로가 환술로 잠깐 내면을 들여다봤다. HP -10. 하지만 해치지는 않았다.'
                },
                {
                    text: '공격한다',
                    effects: { hp: -999 },
                    isGameOver: true,
                    outcome: '무쿠로의 환술에 완전히 삼켜졌다.'
                }
            ]
        }
    ],

    /* ────────────────────────────────────────────
       본고레 수호자 이벤트 (탐색 중 랜덤 등장)
    ──────────────────────────────────────────── */
    guardians: [
        {
            id: 'guardian_yamamoto',
            title: '본고레 수호자 ─ 야마모토 타케시',
            text: '복도 끝에서 유쾌한 목소리가 들려온다.\n야마모토 타케시. 어깨에 야구 가방을 멘 채 걸어오다 너와 눈이 마주쳤다.\n"어, 안 본 얼굴인데. 괜찮아? 다친 데는 없어?"',
            weight: 6,
            minTick: 5,
            options: [
                {
                    text: '"도와줄 수 있어요?" 말을 건다',
                    effects: { food: 5, hp: 15, reputation: { vongola: 12 } },
                    outcome: '"물론이지!" 야마모토가 웃으며 남은 도시락을 건넸다. HP +15, 식량 +5, 본고레 평판 +12.'
                },
                {
                    text: '그의 검에 대해 묻는다',
                    effects: { skills: { combat: 2 }, reputation: { vongola: 8 } },
                    outcome: '"하하, 관심 있어?" 야마모토가 잠깐 검술 자세를 보여줬다. 많이 배웠다. 전투 +2, 본고레 평판 +8.'
                },
                {
                    text: '기습 공격을 시도한다',
                    effects: { hp: -999 },
                    isGameOver: true,
                    outcome: '기습 직전, 어느새 검이 목 앞에 와 있었다. 시구레 소엔류 ─ 빗소리도 들리지 않는 일격이었다.'
                }
            ]
        },
        {
            id: 'guardian_gokudera',
            title: '본고레 수호자 ─ 고쿠데라 하야토',
            text: '다이너마이트를 손가락 사이에 끼운 은발의 소년이 경계 어린 눈빛으로 서 있다.\n고쿠데라 하야토. 본고레 10대 보스의 오른팔.\n"넌 누구야. 수상한 놈이군."',
            weight: 6,
            minTick: 5,
            options: [
                {
                    text: '"10대 보스님을 도우러 왔어요."',
                    effects: { reputation: { vongola: 15 } },
                    outcome: '고쿠데라가 눈을 가늘게 뜨고 잠시 생각하더니 마지못해 고개를 끄덕였다. "... 이번 한 번만." 본고레 평판 +15.'
                },
                {
                    text: '조용히 손을 들어 보인다',
                    effects: { reputation: { vongola: 5 } },
                    outcome: '고쿠데라가 잠시 응시하다 그냥 지나쳤다. 본고레 평판 +5.'
                },
                {
                    text: '도발적으로 쏘아붙인다',
                    effects: { hp: -30, reputation: { vongola: -10 } },
                    outcome: '다이너마이트가 바로 날아왔다. "죽고 싶어?!" HP -30, 본고레 평판 -10.'
                }
            ]
        },
        {
            id: 'guardian_lambo',
            title: '본고레 수호자 ─ 람보',
            text: '"으아앙─! 과자 내놔! 과자!"\n소뿔 달린 아파로 헤어스타일의 아이가 울며 달려온다. 람보다.\n손에는 이미 10년 바주카가 들려 있다.',
            weight: 7,
            minTick: 5,
            options: [
                {
                    text: '가지고 있는 식량을 건넨다',
                    effects: { food: -2, hp: 10, reputation: { vongola: 12 } },
                    outcome: '람보가 울음을 뚝 그치더니 먹을 것을 쥐어주고 달아났다. "람보 씨가 용서해 주겠어!" HP +10, 식량 -2, 본고레 평판 +12.'
                },
                {
                    text: '함께 울어준다',
                    effects: { reputation: { vongola: 8 }, skills: { nego: 1 } },
                    outcome: '당황한 람보가 오히려 울음을 멈췄다. 교묘한 달램이었다. 교섭 +1, 본고레 평판 +8.'
                },
                {
                    text: '무시하고 지나친다',
                    effects: { hp: -20, reputation: { vongola: -5 } },
                    outcome: '10년 바주카가 폭발하더니 어른 람보가 나타났다. "이 녀석!" 번개가 날아왔다. HP -20, 본고레 평판 -5.'
                }
            ]
        },
        {
            id: 'guardian_hibari',
            title: '본고레 수호자 ─ 히바리 쿄야',
            text: '복도가 싸늘해진다.\n히바리 쿄야. 본고레 구름의 수호자.\n그는 쌍 톤파를 손가락에 걸치며 돌아서더니 차갑게 말한다.\n"... 떠들지 마라."',
            weight: 4,
            minTick: 10,
            options: [
                {
                    text: '소리 없이 비켜선다',
                    effects: {},
                    outcome: '히바리가 관심조차 두지 않고 지나쳤다. 최선의 선택이었다.'
                },
                {
                    text: '말을 건다',
                    effects: { hp: -25, reputation: { vongola: -8 } },
                    outcome: '"시끄럽다." 톤파가 날아왔다. 반사적으로 막았지만 HP -25.'
                },
                {
                    text: '맞서 싸운다',
                    effects: { hp: -999 },
                    isGameOver: true,
                    outcome: '톤파가 허공을 갈랐다 싶었을 때, 이미 의식이 없었다. 히바리 쿄야를 상대로 싸운다는 것이 무엇인지 깨달았다 ─ 죽음 뒤에.'
                }
            ]
        },
        {
            id: 'guardian_chrome',
            title: '본고레 수호자 ─ 크롬 도쿠로',
            text: '연기처럼 소녀가 나타났다. 오른쪽 눈에 안대를 한, 조용한 눈빛.\n크롬 도쿠로 ─ 본고레 안개의 수호자이자 무쿠로의 그릇.\n그녀는 말없이 너를 바라본다.',
            weight: 4,
            minTick: 15,
            options: [
                {
                    text: '조용히 인사한다',
                    effects: { reputation: { vongola: 10, kokuyo: 15 } },
                    outcome: '크롬이 작게 고개를 끄덕이더니 사라졌다. 본고레 평판 +10, 고쿠요 평판 +15.'
                },
                {
                    text: '"무쿠로 씨와 함께 계신 건가요?"',
                    effects: { flameEnergy: 10, reputation: { kokuyo: 20 } },
                    outcome: '크롬의 눈이 미세하게 흔들렸다. 그녀가 작은 목소리로 "... 조심해요"라고 말하고 사라졌다. 염력 +10, 고쿠요 평판 +20.'
                },
                {
                    text: '길을 막아선다',
                    effects: { hp: -20, reputation: { kokuyo: -15 } },
                    outcome: '환술 안개가 피어올랐다. 다음 순간 벽에 부딪혀 있었다. HP -20, 고쿠요 평판 -15.'
                }
            ]
        },
        {
            id: 'guardian_ryohei',
            title: '본고레 수호자 ─ 사사가와 료헤이',
            text: '"극한!! 이 복도에 극한으로 수상한 기운이 느껴진다!"\n복싱 글러브를 낀 백발의 청년이 힘차게 달려왔다. 사사가와 료헤이.\n그는 너를 발견하고 두 눈을 빛낸다.',
            weight: 5,
            minTick: 5,
            options: [
                {
                    text: '"극한으로 살아남겠습니다!"',
                    effects: { hp: 20, reputation: { vongola: 15 } },
                    outcome: '"그래! 그 기세다!!" 료헤이가 어깨를 탁 치더니 태양 불꽃으로 상처를 치유해줬다. HP +20, 본고레 평판 +15.'
                },
                {
                    text: '복싱 특훈을 부탁합니다!',
                    effects: { hp: -15, skills: { combat: 2 } },
                    outcome: '"극한으로 특훈이다!!" 땀이 쏟아졌다. 하지만 분명히 강해졌다. 전투 +2 / HP -15.'
                },
                {
                    text: '조용히 지나친다',
                    effects: {},
                    outcome: '"...?" 료헤이가 고개를 갸웃하더니 그냥 보내줬다.'
                }
            ]
        }
    ]
};
