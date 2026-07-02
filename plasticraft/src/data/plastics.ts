export type PlasticId = 'PET' | 'HDPE' | 'PP' | 'PS' | 'PVC';
export type BinCategory = 'blue' | 'green' | 'red';

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
  binCategory: BinCategory;
  binWrongHints: Partial<Record<BinCategory, Tri>>;
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
      ja: 'ぼくは みずみたいに とうめいで、とても じょうぶ！よく のみものの ボトルに なるよ。リサイクルすると ようふくにも なれるんだ！',
      en: "I'm crystal clear and super durable! I become drink bottles, and after recycling I can become clothing!",
    },
    knowledgeHint: {
      zh: '我的好兄弟有飲料瓶跟果汁瓶！我們這一類回收率很高，是回收明星！',
      ja: 'ぼくの なかまには のみものや ジュースの ボトルが いるよ。リサイクルが とくいで、リサイクルの ほしなんだ！',
      en: "My siblings include drink and juice bottles! Our recycling rate is high — we're the recycling stars!",
    },
    siblings: {
      zh: '飲料瓶、果汁瓶、礦泉水瓶',
      ja: 'のみものボトル、ジュースボトル、ミネラルウォーターボトル',
      en: 'Drink bottles, juice bottles, mineral water bottles',
    },
    wrongHints: {},
    binCategory: 'blue',
    binWrongHints: {
      green: { zh: '綠色桶是給 PP 瓶蓋的！PET 寶特瓶要放藍色桶！', ja: 'みどりの ごみばこは PPキャップの ものだよ！PETボトルは あおい ごみばこへ！', en: 'Green bin is for PP caps! PET bottles go in the blue bin!' },
      red:   { zh: '紅色桶是特殊材質用的！PET 可以普通回收，放藍色桶！', ja: 'あかい ごみばこは とくべつな ざいりょうの ものだよ！PETは ふつうに リサイクルできるから あおい ごみばこへ！', en: 'Red is for special plastics! PET is standard recycling — use the blue bin!' },
    },
  },

  HDPE: {
    id: 'HDPE',
    resinCode: 2,
    color: '#81C784',
    lightColor: '#E8F5E9',
    name: { zh: 'HDPE', ja: 'HDPE', en: 'HDPE' },
    fullName: {
      zh: '高密度聚乙烯',
      ja: 'こうみつど ポリエチレン',
      en: 'High-Density Polyethylene',
    },
    identifiedAs: {
      zh: '喔！這是一個 HDPE 奶瓶！',
      ja: 'おー！これは HDPE のミルクボトルだ！',
      en: 'Oh! This is an HDPE milk bottle!',
    },
    mascotHint: {
      zh: '我超級堅硬耐用！通常做成奶瓶、洗髮精瓶，或裝清潔劑的瓶子。我可以重複使用很多次！',
      ja: 'ぼくは とても かたくて じょうぶ！よく ミルクボトルや シャンプーボトルに なるよ。なんかいも つかえるんだ！',
      en: "I'm super tough and durable! Usually made into milk jugs and shampoo bottles. I can be reused many times!",
    },
    knowledgeHint: {
      zh: '我的好兄弟有牛奶桶、洗髮精瓶！我們很硬，可以做成椅子或管道！',
      ja: 'ぼくの なかまには ミルクジャグや シャンプーボトルが いるよ。かたくて いすや パイプにも なれるんだ！',
      en: "My siblings include milk jugs and shampoo bottles! We're tough and can become chairs or pipes!",
    },
    siblings: {
      zh: '牛奶桶、洗髮精瓶、清潔劑瓶',
      ja: 'ミルクジャグ、シャンプーボトル、せんざいボトル',
      en: 'Milk jugs, shampoo bottles, cleaning product bottles',
    },
    wrongHints: {},
    binCategory: 'red',
    binWrongHints: {
      blue: { zh: '藍色桶是給 PET 飲料瓶的！HDPE 要放紅色桶（特殊設施）！', ja: 'あおい ごみばこは PETボトルの ものだよ！HDPEは あかい ごみばこ（とくべつな しせつ）へ！', en: 'Blue bin is for PET bottles! HDPE goes in the red bin (special facility)!' },
      green: { zh: '綠色桶是給 PP 瓶蓋的！HDPE 要放紅色桶（特殊設施）！', ja: 'みどりの ごみばこは PPキャップの ものだよ！HDPEは あかい ごみばこ（とくべつな しせつ）へ！', en: 'Green bin is for PP caps! HDPE goes in the red bin (special facility)!' },
    },
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
        ja: 'ぼくは プラスチックの ヒーロー！あつくても すっぱくても へっちゃら、でんしレンジにも いれられるよ。キャップや たべものの いれものに よく なるんだ！',
      en: "I'm the superhero of plastics! Heat-resistant, acid-resistant, microwave-safe. Often made into bottle caps and food containers!",
    },
    knowledgeHint: {
      zh: '我的好兄弟有豆漿瓶、優格盒！我們耐熱，是食品容器的好選擇！',
        ja: 'ぼくの なかまには とうにゅうボトルや ヨーグルトの いれものが いるよ。あつさに つよくて、たべものの いれものに ぴったりなんだ！',     
      en: 'My siblings include soy milk bottles and yogurt containers! Heat-resistant, perfect for food packaging!',
    },
    siblings: {
      zh: '豆漿瓶、優格盒、吸管',
        ja: 'とうにゅうボトル、ヨーグルトの いれもの、ストロー',   
      en: 'Soy milk bottles, yogurt containers, straws',
    },
    wrongHints: {},
    binCategory: 'green',
    binWrongHints: {
      blue: { zh: '藍色桶是給 PET 飲料瓶的！PP 瓶蓋要放綠色桶！', ja: 'あおい ごみばこは PETボトルの ものだよ！PPキャップは みどりの ごみばこへ！', en: 'Blue bin is for PET bottles! PP caps go in the green bin!' },
      red:  { zh: '紅色桶是特殊材質用的！PP 是一般塑膠，放綠色桶！', ja: あかい ごみばこは とくべつな ざいりょうの ものだよ！PPは ふつうの プラスチックだから みどりの ごみばこへ！', enn: 'Red is for special plastics! PP is general plastic — use the green bin!' },
    },
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
      ja: 'みため は きれいだけど、じつは とても こせいてきなんだ！すっぱいのも あついのも にがてで、からだが ちょっと われやすいんだよ！',   
      en: "I may look clean and simple, but I've got personality! I don't like acid or heat, and I'm a little brittle!",
    },
    knowledgeHint: {
      zh: '我的好兄弟還有養樂多瓶跟保麗龍。我們這一類回收比較麻煩，要特別注意喔！',
      ja: 'ぼくの なかまには ヤクルトボトルや はっぽうスチロールも いるよ。ぼくたちの リサイクルは ちょっと たいへんだから、とくに きを つけてね！',   
      en: 'My siblings include Yakult bottles and foam styrofoam. Our type is harder to recycle — pay special attention!',
    },
    siblings: {
      zh: '養樂多瓶、保麗龍、蛋盒',
      ja: 'ヤクルトボトル、はっぽうスチロール、たまごパック',   
      en: 'Yakult bottles, foam styrofoam, egg cartons',
    },
    wrongHints: {
      PET: {
        zh: 'PET 通常透明如水，做成飲料瓶！而我（PS）比較白不透明，而且容易碎！再試試看？',
        ja: 'PETは みずのように とうめいで、のみものボトルに なるよ！ぼく（PS）は しろくて とうめいじゃなくて、ちょっと われやすいんだ。もういちど ためしてみて？',       
        en: 'PET is crystal clear, like drink bottles! I (PS) am white and opaque, and a bit brittle. Try again?',
      },
      HDPE: {
        zh: 'HDPE 很硬，通常做成奶瓶或洗髮精瓶！而我（PS）比較輕也比較脆！再試試看？',
        ja: 'HDPEは とても かたくて、ミルクボトルに なるよ！ぼく（PS）は かるくて われやすいんだ。もういちど ためしてみて？',        
        en: 'HDPE is tough, like milk jugs! I (PS) am light and brittle. Try again?',
      },
      PP: {
        zh: 'PP 是超級英雄材質，很耐熱！而我（PS）怕燙，放進微波爐我會壞掉！再試試看？',
        ja: 'PPは ヒーローで あついのも へっちゃら！ぼく（PS）は あついのが にがてで、でんしレンジに いれると こわれちゃう！もういちど ためしてみて？',      
        en: 'PP is a superhero — heat resistant! I (PS) hate heat and will break in a microwave. Try again?',
      },
      PVC: {
        zh: 'PVC 通常用在水管或地板！而我（PS）常出現在食品包裝和保麗龍！再試試看？',
        ja: 'PVCは よく パイプや ゆかに つかわれるよ！ぼく（PS）は たべものの ようきや はっぽうスチロールで よく みるよ。もういちど ためしてみて？',     
        en: 'PVC is used in pipes and floors! I (PS) appear in food packaging and foam. Try again?',
      },
    },
    binCategory: 'red',
    binWrongHints: {
      blue: { zh: '藍色桶是給 PET 飲料瓶的! PS 托盤要放紅色桶（特殊設施）! ', ja: 'あおい ごみばこは PETボトルの ものだよ！PSトレイは あかい ごみばこ（とくべつな しせつ）へ！', en: 'Blue bin is for PET bottles! PS trays need the red bin (special facility)!' },     
      green: { zh: '綠色桶是給 PP 瓶蓋的! PS 比較難回收，要放紅色桶（特殊設施）! ', ja: 'みどりの ごみばこは PPキャップの ものだよ！PSは リサイクルが むずかしいから あかい ごみばこ（とくべつな しせつ）へ！', en: 'Green bin is for PP caps! PS is harder to recycle — use the red bin (special facility)!' },    },
  },

  PVC: {
    id: 'PVC',
    resinCode: 3,
    color: '#CE93D8',
    lightColor: '#F3E5F5',
    name: { zh: 'PVC', ja: 'PVC', en: 'PVC' },
    fullName: {
      zh: '聚氯乙烯',
        ja: 'ポリえんか ビニル',    
      en: 'Polyvinyl Chloride',
    },
    identifiedAs: {
      zh: '喔！這是 PVC 材質！',
        ja: 'おー！これは PVC の ざいりょうだ！', 
      en: 'Oh! This is made of PVC!',
    },
    mascotHint: {
      zh: '我通常是硬的，常常做成水管！但也可以加入軟化劑變得很柔軟。我不太好回收喔！',
        ja: 'ぼくは ふつう かたくて、よく パイプに なるよ！でも やわらかくする くすりを いれると やわらかく なれるんだ。あんまり リサイクルが とくいじゃ ないんだけどね！',
      en: "I'm usually hard and often made into pipes! But with softeners I become flexible. I'm not very easy to recycle!",
    },
    knowledgeHint: {
      zh: '我的好兄弟有水管、地板、雨衣！我們用途很廣，但回收比較麻煩。',
        ja: 'ぼくの なかまには パイプ、ゆか、レインコートが いるよ。いろいろな ところで つかわれるけど、リサイクルは たいへんなんだ。',  
      en: 'My siblings include pipes, flooring, and rain coats! We have many uses, but recycling is tricky.',
    },
    siblings: {
      zh: '水管、地板磚、雨衣',
        ja: 'パイプ、ゆかタイル、レインコート', 
      en: 'Water pipes, floor tiles, rain coats',
    },
    wrongHints: {},
    binCategory: 'red',
    binWrongHints: {
        blue: { zh: '藍色桶是給 PET 飲料瓶的! PVC 不容易回收，要放紅色桶（特殊設施）! ', ja: 'あおい ごみばこは PETボトルの ものだよ！PVCは リサイクルが むずかしいから あかい ごみばこ（とくべつな しせつ）へ！', en: 'Blue bin is for PET bottles! PVC is hard to recycle — use the red bin (special facility)!' },
            green: { zh: '綠色桶是給 PP 瓶蓋的! PVC 不容易回收，要放紅色桶（特殊設施）! ', ja: 'みどりの ごみばこは PPキャップの ものだよ！PVCは リサイクルが むずかしいから あかい ごみばこ（とくべつな しせつ）へ！', en: 'Green bin is for PP caps! PVC is hard to recycle — use the red bin (special facility)!' },},
  },
};

/** The plastic type used in demo / simulation mode */
export const DEMO_PLASTIC: PlasticId = 'PS';
