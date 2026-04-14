export type PlasticId = 'PET' | 'HDPE' | 'PP' | 'PS' | 'PVC';

export interface Tri {
  zh: string;
  ja: string;
  en: string;
}

export interface PlasticType {
  id: PlasticId;
  resinCode: number;
  color: string;
  lightColor: string;
  name: Tri;
  fullName: Tri;
  identifiedAs: Tri;
  mascotHint: Tri;
  knowledgeHint: Tri;
  siblings: Tri;
  wrongHints: Partial<Record<PlasticId, Tri>>;
}

export const PLASTICS: Record<PlasticId, PlasticType> = {
  PET: {
    id: 'PET',
    resinCode: 1,
    color: '#4FC3F7',
    lightColor: '#E1F5FE',
    name: { zh: 'PET', ja: 'PET', en: 'PET' },
    fullName: {
      zh: '聚對苯二甲酸乙二酯',
      ja: 'ポリエチレンテレフタレート',
      en: 'Polyethylene Terephthalate',
    },
    identifiedAs: {
      zh: '喔！這是一個 PET 寶特瓶！',
      ja: 'おー！これは PET のボトルだ！',
      en: 'Oh! This is a PET bottle!',
    },
    mascotHint: {
      zh: '我透明如水，超級耐用！常常變成飲料瓶和果汁瓶，回收之後還可以變成衣服喔！',
      ja: '僕は水みたいに透明で、とても丈夫！よく飲み物のボトルになるよ。リサイクルすると洋服にもなれるんだ！',
      en: "I'm crystal clear and super durable! I become drink bottles, and after recycling I can become clothing!",
    },
    knowledgeHint: {
      zh: '我的好兄弟有飲料瓶跟果汁瓶！我們這一類回收率很高，是回收明星！',
      ja: '僕の仲間には飲み物や果汁のボトルがいるよ。リサイクル率がとても高くて、リサイクルの星なんだ！',
      en: "My siblings include drink and juice bottles! Our recycling rate is high — we're the recycling stars!",
    },
    siblings: {
      zh: '飲料瓶、果汁瓶、礦泉水瓶',
      ja: '飲み物ボトル、ジュースボトル、ミネラルウォーターボトル',
      en: 'Drink bottles, juice bottles, mineral water bottles',
    },
    wrongHints: {},
  },

  HDPE: {
    id: 'HDPE',
    resinCode: 2,
    color: '#81C784',
    lightColor: '#E8F5E9',
    name: { zh: 'HDPE', ja: 'HDPE', en: 'HDPE' },
    fullName: {
      zh: '高密度聚乙烯',
      ja: '高密度ポリエチレン',
      en: 'High-Density Polyethylene',
    },
    identifiedAs: {
      zh: '喔！這是一個 HDPE 奶瓶！',
      ja: 'おー！これは HDPE のミルクボトルだ！',
      en: 'Oh! This is an HDPE milk bottle!',
    },
    mascotHint: {
      zh: '我超級堅硬耐用！通常做成奶瓶、洗髮精瓶，或裝清潔劑的瓶子。我可以重複使用很多次！',
      ja: '僕はとても硬くて丈夫！よくミルクボトルやシャンプーボトルになるよ。何度も再利用できるんだ！',
      en: "I'm super tough and durable! Usually made into milk jugs and shampoo bottles. I can be reused many times!",
    },
    knowledgeHint: {
      zh: '我的好兄弟有牛奶桶、洗髮精瓶！我們很硬，可以做成椅子或管道！',
      ja: '僕の仲間にはミルクジャグやシャンプーボトルがいるよ。硬くて椅子やパイプにもなれるんだ！',
      en: "My siblings include milk jugs and shampoo bottles! We're tough and can become chairs or pipes!",
    },
    siblings: {
      zh: '牛奶桶、洗髮精瓶、清潔劑瓶',
      ja: 'ミルクジャグ、シャンプーボトル、洗剤ボトル',
      en: 'Milk jugs, shampoo bottles, cleaning product bottles',
    },
    wrongHints: {},
  },

  PP: {
    id: 'PP',
    resinCode: 5,
    color: '#FFD54F',
    lightColor: '#FFFDE7',
    name: { zh: 'PP', ja: 'PP', en: 'PP' },
    fullName: {
      zh: '聚丙烯',
      ja: 'ポリプロピレン',
      en: 'Polypropylene',
    },
    identifiedAs: {
      zh: '喔！這是一個 PP 瓶蓋！',
      ja: 'おー！これは PP のキャップだ！',
      en: 'Oh! This is a PP bottle cap!',
    },
    mascotHint: {
      zh: '我是塑膠界的超級英雄！耐熱又耐酸，可以放進微波爐。我很常做成瓶蓋和食物容器！',
      ja: '僕はプラスチック界のスーパーヒーロー！耐熱性も耐酸性もあって、電子レンジにも入れられるよ。キャップや食品容器によく使われるんだ！',
      en: "I'm the superhero of plastics! Heat-resistant, acid-resistant, microwave-safe. Often made into bottle caps and food containers!",
    },
    knowledgeHint: {
      zh: '我的好兄弟有豆漿瓶、優格盒！我們耐熱，是食品容器的好選擇！',
      ja: '僕の仲間には豆乳ボトルやヨーグルト容器がいるよ。耐熱で、食品容器に最適なんだ！',
      en: 'My siblings include soy milk bottles and yogurt containers! Heat-resistant, perfect for food packaging!',
    },
    siblings: {
      zh: '豆漿瓶、優格盒、吸管',
      ja: '豆乳ボトル、ヨーグルト容器、ストロー',
      en: 'Soy milk bottles, yogurt containers, straws',
    },
    wrongHints: {},
  },

  PS: {
    id: 'PS',
    resinCode: 6,
    color: '#FF8A65',
    lightColor: '#FBE9E7',
    name: { zh: 'PS', ja: 'PS', en: 'PS' },
    fullName: {
      zh: '聚苯乙烯',
      ja: 'ポリスチレン',
      en: 'Polystyrene',
    },
    identifiedAs: {
      zh: '喔！這是一個 PS 肉托盤！',
      ja: 'おー！これは PS のミートトレイだ！',
      en: 'Oh! This is a PS meat tray!',
    },
    mascotHint: {
      zh: '我雖然看起來白淨，但我其實很有個性，我怕酸也怕燙，而且身體有點脆（易碎）喔！',
      ja: '見た目はきれいに見えるけど、実はとても個性的なんだ！酸と熱が苦手で、体が少し脆いんだよ！',
      en: "I may look clean and simple, but I've got personality! I don't like acid or heat, and I'm a little brittle!",
    },
    knowledgeHint: {
      zh: '我的好兄弟還有養樂多瓶跟保麗龍。我們這一類回收比較麻煩，要特別注意喔！',
      ja: '僕の仲間にはヤクルトボトルや発泡スチロールもいるよ。僕たちのリサイクルはちょっと大変だから、特に注意してね！',
      en: 'My siblings include Yakult bottles and foam styrofoam. Our type is harder to recycle — pay special attention!',
    },
    siblings: {
      zh: '養樂多瓶、保麗龍、蛋盒',
      ja: 'ヤクルトボトル、発泡スチロール、卵パック',
      en: 'Yakult bottles, foam styrofoam, egg cartons',
    },
    wrongHints: {
      PET: {
        zh: 'PET 通常透明如水，做成飲料瓶！而我（PS）比較白不透明，而且容易碎！再試試看？',
        ja: 'PETは水のように透明で、飲み物ボトルになるよ！僕（PS）は白くて不透明で、少し割れやすいんだ。もう一度試してみて？',
        en: 'PET is crystal clear, like drink bottles! I (PS) am white and opaque, and a bit brittle. Try again?',
      },
      HDPE: {
        zh: 'HDPE 很硬，通常做成奶瓶或洗髮精瓶！而我（PS）比較輕也比較脆！再試試看？',
        ja: 'HDPEはとても硬くて、ミルクボトルになるよ！僕（PS）は軽くて脆いんだ。もう一度試してみて？',
        en: 'HDPE is tough, like milk jugs! I (PS) am light and brittle. Try again?',
      },
      PP: {
        zh: 'PP 是超級英雄材質，很耐熱！而我（PS）怕燙，放進微波爐我會壞掉！再試試看？',
        ja: 'PPはスーパーヒーローで耐熱性があるよ！僕（PS）は熱が苦手で、電子レンジに入れると壊れちゃう！もう一度試してみて？',
        en: 'PP is a superhero — heat resistant! I (PS) hate heat and will break in a microwave. Try again?',
      },
      PVC: {
        zh: 'PVC 通常用在水管或地板！而我（PS）常出現在食品包裝和保麗龍！再試試看？',
        ja: 'PVCはよくパイプや床材に使われるよ！僕（PS）は食品包装や発泡スチロールによく登場するんだ。もう一度試してみて？',
        en: 'PVC is used in pipes and floors! I (PS) appear in food packaging and foam. Try again?',
      },
    },
  },

  PVC: {
    id: 'PVC',
    resinCode: 3,
    color: '#CE93D8',
    lightColor: '#F3E5F5',
    name: { zh: 'PVC', ja: 'PVC', en: 'PVC' },
    fullName: {
      zh: '聚氯乙烯',
      ja: 'ポリ塩化ビニル',
      en: 'Polyvinyl Chloride',
    },
    identifiedAs: {
      zh: '喔！這是 PVC 材質！',
      ja: 'おー！これは PVC の素材だ！',
      en: 'Oh! This is made of PVC!',
    },
    mascotHint: {
      zh: '我通常是硬的，常常做成水管！但也可以加入軟化劑變得很柔軟。我不太好回收喔！',
      ja: '僕は通常硬くて、よくパイプになるよ！でも軟化剤を加えると柔らかくなれるんだ。あまりリサイクルが得意じゃないんだけどね！',
      en: "I'm usually hard and often made into pipes! But with softeners I become flexible. I'm not very easy to recycle!",
    },
    knowledgeHint: {
      zh: '我的好兄弟有水管、地板、雨衣！我們用途很廣，但回收比較麻煩。',
      ja: '僕の仲間にはパイプ、床材、レインコートがいるよ。用途は広いけど、リサイクルは大変なんだ。',
      en: 'My siblings include pipes, flooring, and rain coats! We have many uses, but recycling is tricky.',
    },
    siblings: {
      zh: '水管、地板磚、雨衣',
      ja: 'パイプ、床タイル、レインコート',
      en: 'Water pipes, floor tiles, rain coats',
    },
    wrongHints: {},
  },
};

/** The plastic type used in demo / simulation mode */
export const DEMO_PLASTIC: PlasticId = 'PS';
