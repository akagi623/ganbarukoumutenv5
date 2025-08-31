
import { DifficultyLevel, Office, EquipmentItem, Project, EmployeeCandidateBase } from './types';

export const BASE_SAVE_KEY = 'ganbaru-koumuten-savegame-v3';
export const MAX_SAVE_SLOTS = 3;

export const WEEKS_IN_MONTH = 4;
export const MONTHS_IN_YEAR = 12;

export const BASE_VALUES = {
    HIRE_COST_PAID: 500000,
    TRAINING_COST_PER_EMPLOYEE: 100000,
    TRAINING_SKILL_GAIN: 10,
    INITIAL_YEAR: 1,
    INITIAL_MONTH: 1,
    INITIAL_WEEK: 1,
};

export const DIFFICULTY_SETTINGS = {
    [DifficultyLevel.EASY]: {
        label: "Easy (やさしい)",
        balance: {
            initial_funds_multiplier: 1.5,
            project_success_rate_modifier: 15,
            recruitment_success_modifier: 20,
            employee_parameter_change_rate: { stamina_loss_rate: 0.8, motivation_loss_rate: 0.8, stamina_gain_rate: 1.2, motivation_gain_rate: 1.2 }
        }
    },
    [DifficultyLevel.NORMAL]: {
        label: "Normal (ふつう)",
        balance: {
            initial_funds_multiplier: 1.0,
            project_success_rate_modifier: 0,
            recruitment_success_modifier: 0,
            employee_parameter_change_rate: { stamina_loss_rate: 1.0, motivation_loss_rate: 1.0, stamina_gain_rate: 1.0, motivation_gain_rate: 1.0 }
        }
    },
    [DifficultyLevel.HARD]: {
        label: "Hard (むずかしい)",
        balance: {
            initial_funds_multiplier: 0.6,
            project_success_rate_modifier: -10,
            recruitment_success_modifier: -15,
            employee_parameter_change_rate: { stamina_loss_rate: 1.2, motivation_loss_rate: 1.2, stamina_gain_rate: 0.8, motivation_gain_rate: 0.8 }
        }
    },
    [DifficultyLevel.VERY_HARD]: {
        label: "Very Hard (とてもむずかしい)",
        balance: {
            initial_funds_multiplier: 0.3,
            project_success_rate_modifier: -20,
            recruitment_success_modifier: -30,
            employee_parameter_change_rate: { stamina_loss_rate: 1.5, motivation_loss_rate: 1.5, stamina_gain_rate: 0.7, motivation_gain_rate: 0.7 }
        }
    }
};

export const INITIAL_OFFICES_BY_DIFFICULTY: Record<DifficultyLevel, Office> = {
    [DifficultyLevel.EASY]: { name: "小さな賃貸事務所", rent_monthly: 100000, employee_capacity: 5 },
    [DifficultyLevel.NORMAL]: { name: "かなり小さな賃貸事務所 (少し古い)", rent_monthly: 80000, employee_capacity: 4 },
    [DifficultyLevel.HARD]: { name: "ボロボロの賃貸事務所 (雨漏り注意)", rent_monthly: 50000, employee_capacity: 3 },
    [DifficultyLevel.VERY_HARD]: { name: "プレハブ小屋", rent_monthly: 30000, employee_capacity: 2 },
};

export const ALL_OFFICES_FOR_UPGRADE: Office[] = [
    INITIAL_OFFICES_BY_DIFFICULTY[DifficultyLevel.VERY_HARD],
    INITIAL_OFFICES_BY_DIFFICULTY[DifficultyLevel.HARD],
    INITIAL_OFFICES_BY_DIFFICULTY[DifficultyLevel.NORMAL],
    INITIAL_OFFICES_BY_DIFFICULTY[DifficultyLevel.EASY],
    { name: "手頃な広さのオフィス", rent_monthly: 180000, employee_capacity: 8 },
    { name: "中規模オフィス", rent_monthly: 300000, employee_capacity: 12 },
    { name: "広々としたオフィスフロア", rent_monthly: 500000, employee_capacity: 20 },
    { name: "立派なオフィスビル（ワンフロア）", rent_monthly: 800000, employee_capacity: 30 },
    { name: "自社ビル（小規模）", rent_monthly: 1200000, employee_capacity: 50 },
].filter((office, index, self) =>
    index === self.findIndex((o) => (
        o.name === office.name && o.employee_capacity === office.employee_capacity
    ))
).sort((a, b) => a.employee_capacity - b.employee_capacity);

export const POWERED_SUIT_NAME = "パワードスーツ";
export const AUTOMATED_CONSTRUCTION_MACHINE_NAME = "全自動建機";

export const GHOST_EQUIPMENT: EquipmentItem[] = [
    { name: POWERED_SUIT_NAME, cost: 10000000 },
    { name: AUTOMATED_CONSTRUCTION_MACHINE_NAME, cost: 25000000 },
    { name: "大型クレーン", cost: 35000000 },
    { name: "最新鋭の建機フルセット", cost: 80000000 },
    { name: "大規模観客席設置システム", cost: 50000000 },
];

const REWARD_MULTIPLIER = 2.5;

export const ALL_PROJECTS: Project[] = [
    { id:"P001", name: "犬小屋の修理", reward: 75000 * REWARD_MULTIPLIER, total_workload: 1, required_skill: 1, required_employees_min: 1, required_equipment: [], description: "愛犬のポチが、最近どうも浮かない顔をしています。どうやらマイホームの老朽化が原因のようで…。彼がもう一度、誇りを持って暮らせる家を用意してあげたいのです。" },
    { id:"P002", name: "キッチン水栓の交換", reward: 100000 * REWARD_MULTIPLIER, total_workload: 1, required_skill: 8, required_employees_min: 1, required_equipment: ["水道工事工具セット"], description: "眠りにつく頃、静寂の中に響く『ポツン…ポツン…』という音。もはや精神的な挑戦です。この戦いに終止符を打つべく、腕利きの職人さんを求めています。" },
    { id:"P003", name: "雨どいの清掃と修理", reward: 150000 * REWARD_MULTIPLIER, total_workload: 2, required_skill: 5, required_employees_min: 1, required_equipment: ["脚立"], description: "我が家の雨どいが、いつの間にか小さなビオトープと化しています。自然との共生も大切ですが、まずは建物の健康が第一。専門家のお力をお貸しください。" },
    { id:"P004", name: "畳の表替え（6畳）", reward: 180000 * REWARD_MULTIPLIER, total_workload: 2, required_skill: 10, required_employees_min: 2, required_equipment: [], description: "新しい畳の、あの清々しい香りが忘れられません。深呼吸すれば、心が洗われるようなあの感覚。もう一度、私の部屋にあの息吹を呼び戻してください。" },
    { id:"P005", name: "壁紙の一部張り替え", reward: 200000 * REWARD_MULTIPLIER, total_workload: 2, required_skill: 12, required_employees_min: 2, required_equipment: ["内装工具セット"], description: "事件現場、というわけではないのですが…。子供が描いた壁の落書きが前衛的すぎて、来客のたびに解説を求められます。元の、静かで平和な壁に戻していただけないでしょうか。" },
    { id:"P006", name: "害獣侵入経路の封鎖", reward: 250000 * REWARD_MULTIPLIER, total_workload: 3, required_skill: 15, required_employees_min: 2, required_equipment: ["高性能電動ドリルセット"], description: "彼らは夜の訪問者。足音を忍ばせることもなく、天井裏でパーティーを繰り広げます。どうか、この招かれざる客たちのVIP用エントランスを完全に塞いでください。" },
    { id:"P007", name: "フェンスの設置（10m）", reward: 300000 * REWARD_MULTIPLIER, total_workload: 4, required_skill: 20, required_employees_min: 2, required_equipment: ["中古の軽トラック", "コンクリートミキサー"], description: "親しき仲にも礼儀あり、と申します。お隣さんとの良好な関係を末永く続けるためにも、ここに明確で美しい境界線を引きたく思います。" },
    { id:"P008", name: "個人宅の書斎リフォーム", reward: 800000 * REWARD_MULTIPLIER, total_workload: 4, required_skill: 15, required_employees_min: 2, required_equipment: ["内装工具セット", "高性能電動ドリルセット"], description: "私の頭の中にある無数のアイデアを形にするには、この書斎はあまりにも混沌としている。思考を整理し、創造性を最大限に引き出すための『司令室』を構築してほしい。" },
    { id:"P009", name: "イベントステージ設営", reward: 800000 * REWARD_MULTIPLIER, total_workload: 10, required_skill: 20, required_employees_min: 10, required_equipment: ["足場セット（イベント用）", "照明・音響機材"], description: "一夜限り、この街に魔法をかけたいのです。無名のアーティストたちが、最高の輝きを放つための舞台。あなたの技術で、彼らの夢を支えてくれませんか。" },
    { id:"P010", name: "カーポートの設置", reward: 900000 * REWARD_MULTIPLIER, total_workload: 5, required_skill: 22, required_employees_min: 2, required_equipment: ["中古の軽トラック", "コンクリートミキサー"], description: "私の愛車は、ただの鉄の塊ではありません。共に旅をしてきた相棒です。彼を風雨や不躾な視線から守るための、堅牢かつ美しいガレージを希望します。" },
    { id:"P011", name: "木造家屋の解体", reward: 1000000 * REWARD_MULTIPLIER, total_workload: 8, required_skill: 25, required_employees_min: 4, required_equipment: ["中古の重機（小型ショベル）"], description: "この家は、家族の歴史そのものでした。しかし、過去に縛られるのではなく、未来のために場所を空ける時が来たようです。感謝を込めて、その役目を終えさせてやってください。" },
    { id:"P012", name: "バリアフリー化リフォーム", reward: 1200000 * REWARD_MULTIPLIER, total_workload: 8, required_skill: 25, required_employees_min: 2, required_equipment: ["内装工具セット", "高性能電動ドリルセット"], description: "祖母は『まだまだ平気』と笑いますが、その一歩に、私たちは息をのみます。彼女のプライドを傷つけず、ただ、さりげなく安全を届けたい。そんなリフォームは可能でしょうか。" },
    { id:"P013", name: "システムキッチンの導入", reward: 1500000 * REWARD_MULTIPLIER, total_workload: 10, required_skill: 35, required_employees_min: 3, required_equipment: ["内装工具セット", "水道・ガス工事設備"], description: "レシピサイトを眺めるのが趣味ですが、我が家のキッチンでは再現できない料理が多すぎるのです。道具のせいにしたくない。だから、最高のキッチンで自分の限界に挑戦したいのです。" },
    { id:"P014", name: "ユニットバスの交換", reward: 1800000 * REWARD_MULTIPLIER, total_workload: 10, required_skill: 38, required_employees_min: 3, required_equipment: ["内装工具セット", "水道工事工具セット"], description: "一日の終わりに、心身を預ける場所。それがバスルームだと思うのです。体を洗うだけの場所ではなく、思考をリセットできるような、瞑想的な空間を創り上げてください。" },
    { id:"P015", name: "アパートの一室まるごとリフォーム", reward: 2000000 * REWARD_MULTIPLIER, total_workload: 12, required_skill: 30, required_employees_min: 3, required_equipment: ["中古の軽トラック", "内装工具セット", "小型発電機"], description: "この一部屋だけが、なぜか時が止まったままなのです。新しい時代の空気を吹き込み、次の住人が『ここが私の居場所だ』と感じられるような、魅力的な空間へと生まれ変わらせてください。" },
    { id:"P016", name: "一軒家の外壁塗装", reward: 2500000 * REWARD_MULTIPLIER, total_workload: 12, required_skill: 40, required_employees_min: 4, required_equipment: ["足場セット（低層用）", "高圧洗浄機"], description: "家の外壁は、家族の顔だと考えています。最近、少し疲れた顔をしているように見える我が家を、もう一度、晴れやかな表情にしてあげたいのです。" },
    { id:"P017", name: "小規模店舗（カフェ）の内装工事", reward: 5000000 * REWARD_MULTIPLIER, total_workload: 15, required_skill: 50, required_employees_min: 5, required_equipment: ["内装工具セット", "CAD設計システム"], description: "人々が、本とコーヒーを片手に、自分だけの時間に浸れるような隠れ家を作りたい。扉を開ければ、日常を忘れられる。そんな、物語の始まりの場所を。" },
    { id:"P018", name: "鉄骨造り倉庫の建設", reward: 12000000 * REWARD_MULTIPLIER, total_workload: 20, required_skill: 60, required_employees_min: 5, required_equipment: ["中古の小型クレーン付きトラック", "溶接機セット", "鉄骨組立工具一式"], description: "我々の製品は、ここで生まれ、ここから世界へ旅立っていく。その出発点を守る、機能的で、一切の無駄がない、美しい砦を築いてほしい。" },
    { id:"P019", name: "古民家再生プロジェクト", reward: 18000000 * REWARD_MULTIPLIER, total_workload: 30, required_skill: 70, required_employees_min: 8, required_equipment: ["伝統工具一式", "構造補強材", "CAD設計システム"], description: "この柱の傷、梁の煤。すべてがこの土地の記憶です。その記憶を尊重しつつ、未来へと物語を紡いでいく。そんな、過去と未来をつなぐ仕事をお願いしたい。" },
    { id:"P020", name: "災害復旧（堤防の仮設工事）", reward: 20000000 * REWARD_MULTIPLIER, total_workload: 40, required_skill: 70, required_employees_min: 50, required_equipment: ["重機（ブルドーザー等）", "プレハブ事務所"], description: "希望の光が消えかけています。ですが、私たちは諦めません。再び立ち上がるための第一歩として、この川の流れを鎮め、人々の心に安寧を取り戻すための壁が必要です。" },
    { id:"P021", name: "ログハウスの建設", reward: 20000000 * REWARD_MULTIPLIER, total_workload: 25, required_skill: 75, required_employees_min: 6, required_equipment: ["チェーンソー", "ログハウス組立キット", "中古の小型クレーン付きトラック"], description: "自然の厳しさと優しさ、その両方を感じながら生きていきたい。木が呼吸し、季節の移ろいと共に表情を変える。そんな生命力あふれる家を建ててほしい。" },
    { id:"P022", name: "デザイナーズ住宅の新築", reward: 25000000 * REWARD_MULTIPLIER, total_workload: 48, required_skill: 80, required_employees_min: 8, required_equipment: ["CAD設計システム", "内装・外装仕上げフルセット"], description: "私が欲しいのは『家』という名の、私自身を表現するアート作品だ。常識や調和は二の次でいい。あなたの持つ最高の技術と感性で、私のビジョンを具現化してくれたまえ。" },
    { id:"P023", name: "木造アパート（4戸）の新築", reward: 35000000 * REWARD_MULTIPLIER, total_workload: 60, required_skill: 85, required_employees_min: 10, required_equipment: ["CAD設計システム", "足場セット（低層用）", "中古の小型クレーン付きトラック"], description: "ただの賃貸住宅ではありません。そこに住む人々が交流し、小さなコミュニティが生まれるような、そんな温かみのある集合住宅を構想しています。あなたの力を貸してください。" },
    { id:"P024", name: "公民館の建設", reward: 40000000 * REWARD_MULTIPLIER, total_workload: 70, required_skill: 88, required_employees_min: 15, required_equipment: ["CAD設計システム", "足場セット（中層用）", "中古の小型クレーン付きトラック"], description: "この街の未来を担う子供たち、そして街を築き上げてきた先達たち。全ての世代が知恵と笑顔を交換できる、そんな街のリビングルームとなる建物を、どうかお願いします。" },
    { id:"P025", name: "地下シェルターの建造", reward: 50000000 * REWARD_MULTIPLIER, total_workload: 80, required_skill: 88, required_employees_min: 15, required_equipment: ["トンネル掘削機", "特殊コンクリート", "空気清浄システム"], description: "備えあれば憂いなし、と言います。これは保険のようなもの。ですが、どうせ備えるなら、有事の際にも文明的な生活を維持できる、最高の環境を望みます。これは、未来への投資です。" },
    { id:"P026", name: "首都タワー建造", reward: 150000000 * REWARD_MULTIPLIER, total_workload: 200, required_skill: 90, required_employees_min: 20, required_equipment: [POWERED_SUIT_NAME, AUTOMATED_CONSTRUCTION_MACHINE_NAME], description: "我々は、空に届くほどの野心を持っている。このタワーは、単なる建造物ではない。不可能を可能にするという、我々の意志そのものだ。歴史に名を刻む仕事をしようじゃないか。" },
    { id:"P027", name: "世界大運動会2025会場建設", reward: 200000000 * REWARD_MULTIPLIER, total_workload: 250, required_skill: 98, required_employees_min: 80, required_equipment: ["大型クレーン", POWERED_SUIT_NAME, "最新鋭の建機フルセット", "大規模観客席設置システム"], description: "2025年、世界の視線がこの地に注がれる。アスリートたちの汗と涙、観客たちの歓声、そのすべてを受け止める器が必要だ。単なる競技場ではない、歴史が生まれる聖地を、君たちの手で創造してほしい。" }
].map(p => ({ 
    ...p, 
    reputation_gain: Math.max(0.1, p.reward / (2000000 * REWARD_MULTIPLIER) ), 
    required_reputation: Math.min(5, Math.max(1, Math.ceil(p.required_skill / 15))) // Ensure required_reputation is capped at 5
}));

export const ALL_EQUIPMENT: EquipmentItem[] = [
    { name: "脚立", cost: 20000 },
    { name: "高圧洗浄機", cost: 60000 },
    { name: "高性能電動ドリルセット", cost: 70000 },
    { name: "内装工具セット", cost: 120000 },
    { name: "小型発電機", cost: 150000 },
    { name: "水道工事工具セット", cost: 170000 },
    { name: "溶接機セット", cost: 180000 },
    { name: "足場セット（低層用）", cost: 250000 },
    { name: "コンクリートミキサー", cost: 300000 },
    { name: "中古の軽トラック", cost: 400000 },
    { name: "鉄骨組立工具一式", cost: 400000 },
    { name: "照明・音響機材", cost: 500000 },
    { name: "太陽光パネル", cost: 700000 },
    { name: "内装・外装仕上げフルセット", cost: 900000 },
    { name: "CAD設計システム", cost: 1200000 },
    { name: "中古の小型クレーン付きトラック", cost: 1500000 },
    { name: "水道・ガス工事設備", cost: 1800000 },
    { name: "中古の重機（小型ショベル）", cost: 2500000 },
    { name: "足場セット（イベント用）", cost: 2800000 },
    { name: "伝統工具一式", cost: 3000000 },
    { name: "チェーンソー", cost: 3200000 },
    { name: "ログハウス組立キット", cost: 4000000 },
    { name: "構造補強材", cost: 4500000 },
    { name: "足場セット（中層用）", cost: 5000000 },
    { name: "プレハブ事務所", cost: 6000000 },
    { name: "重機（ブルドーザー等）", cost: 8000000 },
    { name: "空気清浄システム", cost: 12000000 },
    { name: "特殊コンクリート", cost: 15000000 },
    { name: "トンネル掘削機", cost: 40000000 },
    ...GHOST_EQUIPMENT
];

const MALE_FREE_CANDIDATES: EmployeeCandidateBase[] = Array.from({ length: 30 }, (_, i) => {
    const names = [
        ['鈴木', '一郎'], ['高橋', '健太'], ['田中', '大輔'], ['渡辺', '翔'], ['伊藤', '拓也'],
        ['山本', '直人'], ['中村', '悠'], ['小林', '亮'], ['加藤', '雄大'], ['吉田', '翼'],
        ['山田', '蓮'], ['佐々木', '湊'], ['山口', '樹'], ['松本', '蒼'], ['井上', '陸'],
        ['木村', '大和'], ['林', '陽翔'], ['斎藤', '隼人'], ['清水', '誠'], ['山崎', '徹'],
        ['森', '修平'], ['池田', '圭太'], ['橋本', '雅也'], ['阿部', '勇気'], ['石川', '渉'],
        ['前田', '拓実'], ['藤田', '亮'], ['小川', '悠人'], ['岡田', '航平'], ['後藤', '颯太']
    ];
    const roles = ['見習い', '未経験者', '新人スタッフ'];
    const descriptions = [
        '「体力なら任せろ！」が口癖の熱血漢。ただ、方向音痴なのが玉にキズで、初めての現場ではよく迷子になる。',
        'やる気スイッチが常に入りっぱなしの好青年。たまに空回りするが、その素直さは誰もが認めるところ。実家は農家で、トラクターの運転が得意らしい。',
        '「根性見せます！」と意気込むが、カナヅチとノコギリの区別がまだ怪しい。休日は筋トレに明け暮れている。',
        '力仕事なら誰にも負けないと自負しているが、細かい作業になると途端に指が震えだす。好物は大盛りのカツカレー。',
        'いつか自分の手でマイホームを建てるのが夢。その第一歩として、この業界に飛び込んできた。夢見る瞳は誰よりも輝いている。'
    ];
    const name = names[i % names.length];
    return {
        fullName: `${name[0]} ${name[1]}${i >= names.length ? (Math.floor(i/names.length) + 1) : ''}`,
        role: roles[i % roles.length],
        salary_monthly: 160000 + Math.floor(Math.random() * 8) * 5000,
        skill_point: 1 + Math.floor(Math.random() * 10),
        stamina: 60 + Math.floor(Math.random() * 41),
        motivation: 50 + Math.floor(Math.random() * 41),
        description: descriptions[i % descriptions.length],
        imagePath: `assets_mnonpaid/mnonpaid${(i + 1).toString().padStart(2, '0')}.jpg`
    };
});

const MALE_PAID_CANDIDATES: EmployeeCandidateBase[] = [
    { fullName: '田中 健太', role: '経験者', salary_monthly: 280000, skill_point: 25, stamina: 40, motivation: 45, description: 'いくつかの現場を渡り歩いてきたおかげで、対応力には自信あり。無類のラーメン好きで、現場近くの美味しい店をリサーチするのが日課。', imagePath: 'assets_mpaid/mpaid01.jpg' },
    { fullName: '伊藤 誠', role: 'ベテラン', salary_monthly: 360000, skill_point: 42, stamina: 38, motivation: 35, description: 'この道20年。その経験に裏打ちされた勘は、時に最新の機械よりも頼りになる。趣味は演歌を聴きながらの晩酌。', imagePath: 'assets_mpaid/mpaid02.jpg' },
    { fullName: '渡辺 拓也', role: '多能工', salary_monthly: 320000, skill_point: 35, stamina: 48, motivation: 50, description: '大抵のことは一人でこなせる器用さが売り。だが、極度の猫舌で、熱いコーヒーを飲むのに30分かかるという弱点も。', imagePath: 'assets_mpaid/mpaid03.jpg' },
    { fullName: '佐藤 翔太', role: '職長', salary_monthly: 340000, skill_point: 30, stamina: 55, motivation: 60, description: '現場をまとめるリーダーシップと、その大きな声が持ち味。彼の「安全第一！」の声は、3ブロック先まで聞こえるとか。', imagePath: 'assets_mpaid/mpaid04.jpg' },
    { fullName: '中村 雄太', role: '若手ホープ', salary_monthly: 250000, skill_point: 22, stamina: 65, motivation: 68, description: '体力とやる気は誰にも負けない若手の星。休日はプロテインを片手にジム通い。将来の夢は「動ける社長」。', imagePath: 'assets_mpaid/mpaid05.jpg' },
    { fullName: '小林 大輔', role: '経験者', salary_monthly: 290000, skill_point: 28, stamina: 42, motivation: 40, description: 'どんな状況でも冷静さを失わないポーカーフェイス。しかし、犬の動画を見ると顔がデレデレに崩れるらしい。', imagePath: 'assets_mpaid/mpaid06.jpg' },
    { fullName: '加藤 純', role: 'ベテラン', salary_monthly: 370000, skill_point: 45, stamina: 36, motivation: 32, description: '伝統的な工法に精通しており、その仕事は「芸術品」と評される。だが、スマホの操作は苦手で、よく娘に助けを求めている。', imagePath: 'assets_mpaid/mpaid07.jpg' },
    { fullName: '吉田 徹', role: '多能工', salary_monthly: 330000, skill_point: 38, stamina: 50, motivation: 52, description: '電気工事から塗装までこなす資格マニア。彼の工具箱は、もはや四次元ポケット状態だとの噂。', imagePath: 'assets_mpaid/mpaid08.jpg' },
    { fullName: '山田 聡', role: '職長', salary_monthly: 350000, skill_point: 33, stamina: 58, motivation: 62, description: '安全管理に厳しく、ヘルメットのあご紐の角度までチェックする。彼の現場ではかすり傷一つ許されない。', imagePath: 'assets_mpaid/mpaid09.jpg' },
    { fullName: '佐々木 直樹', role: '若手ホープ', salary_monthly: 260000, skill_point: 24, stamina: 68, motivation: 70, description: '最新のガジェットや建機に目がなく、給料のほとんどをつぎ込んでいる。彼のドローン操縦技術はプロ級。', imagePath: 'assets_mpaid/mpaid10.jpg' },
    { fullName: '山口 健一', role: '経験者', salary_monthly: 300000, skill_point: 30, stamina: 45, motivation: 48, description: 'チームでの連携作業が得意なムードメーカー。彼のダジャレは現場の緊張を和ませるが、時々スベる。', imagePath: 'assets_mpaid/mpaid11.jpg' },
    { fullName: '松本 浩二', role: 'ベテラン', salary_monthly: 380000, skill_point: 48, stamina: 34, motivation: 30, description: '寡黙だが、仕事の正確さはピカイチ。彼の辞書に「妥協」の文字はない。趣味は盆栽。', imagePath: 'assets_mpaid/mpaid12.jpg' },
    { fullName: '井上 竜也', role: '多能工', salary_monthly: 340000, skill_point: 40, stamina: 52, motivation: 55, description: 'トラブルシューティングが得意な頼れる兄貴分。難しい現場ほど「燃えるぜ」と不敵に笑う。', imagePath: 'assets_mpaid/mpaid13.jpg' },
    { fullName: '木村 修平', role: '職長', salary_monthly: 360000, skill_point: 36, stamina: 60, motivation: 65, description: '若手の育成にも熱心な面倒見の良い職長。手作りの弁当を分けてくれることもあり、皆から慕われている。', imagePath: 'assets_mpaid/mpaid14.jpg' },
    { fullName: '林 圭太', role: '若手ホープ', salary_monthly: 270000, skill_point: 26, stamina: 70, motivation: 72, description: '元体育会系で、どんな過酷な現場でも音を上げないガッツの持ち主。挨拶の声が大きすぎて、たまに驚かれる。', imagePath: 'assets_mpaid/mpaid15.jpg' },
    { fullName: '斎藤 雅也', role: '経験者', salary_monthly: 310000, skill_point: 32, stamina: 48, motivation: 50, description: '設計図を読むのが得意なインテリ派。だが、実は大のアニメ好きで、休日はイベントに参加しているらしい。', imagePath: 'assets_mpaid/mpaid16.jpg' },
    { fullName: '清水 勇気', role: 'ベテラン', salary_monthly: 390000, skill_point: 50, stamina: 32, motivation: 28, description: '数々の修羅場をくぐり抜けてきた生き字引。彼の武勇伝は、一晩あっても語り尽くせない。', imagePath: 'assets_mpaid/mpaid17.jpg' },
    { fullName: '山崎 渉', role: '多能工', salary_monthly: 350000, skill_point: 42, stamina: 55, motivation: 58, description: '重機の操作から内装仕上げまで、彼にできないことはない。自称「歩く総合建設会社」。', imagePath: 'assets_mpaid/mpaid18.jpg' },
    { fullName: '森 拓実', role: '職長', salary_monthly: 370000, skill_point: 38, stamina: 62, motivation: 68, description: 'コミュニケーション能力が高く、施主との折衝も得意。現場の潤滑油的存在だが、極度の花粉症に悩まされている。', imagePath: 'assets_mpaid/mpaid19.jpg' },
    { fullName: '池田 亮', role: '若手ホープ', salary_monthly: 280000, skill_point: 28, stamina: 72, motivation: 75, description: 'とにかく仕事が早い。「時間を金で買う」がモットーで、最新の電動工具に目が無い。', imagePath: 'assets_mpaid/mpaid20.jpg' },
    { fullName: '橋本 悠人', role: '経験者', salary_monthly: 285000, skill_point: 27, stamina: 44, motivation: 46, description: 'リフォーム案件の経験が豊富。細かい作業も苦にしないが、お化け屋敷だけは絶対に入れないらしい。', imagePath: 'assets_mpaid/mpaid21.jpg' },
    { fullName: '阿部 航平', role: 'ベテラン', salary_monthly: 400000, skill_point: 52, stamina: 30, motivation: 25, description: '特殊な建材や工法の知識が豊富で、技術指導を任されることも。彼の講義は大学の授業より面白いと評判。', imagePath: 'assets_mpaid/mpaid22.jpg' },
    { fullName: '石川 颯太', role: '多能工', salary_monthly: 335000, skill_point: 37, stamina: 53, motivation: 56, description: '道具へのこだわりが強く、常に手入れを欠かさない。彼の道具はいつもピカピカで、神々しい光を放っている。', imagePath: 'assets_mpaid/mpaid23.jpg' },
    { fullName: '山下 大地', role: '職長', salary_monthly: 355000, skill_point: 34, stamina: 59, motivation: 64, description: 'どんな困難な状況でもチームを鼓舞する熱血職長。口癖は「なんとかなる！絶対なる！」。', imagePath: 'assets_mpaid/mpaid24.jpg' },
    { fullName: '中島 蓮', role: '若手ホープ', salary_monthly: 255000, skill_point: 23, stamina: 67, motivation: 71, description: '物静かだが、一度任された仕事は完璧にこなす。内に秘めた情熱は、マグマのように熱い。', imagePath: 'assets_mpaid/mpaid25.jpg' },
    { fullName: '前田 翼', role: '経験者', salary_monthly: 295000, skill_point: 29, stamina: 43, motivation: 47, description: '高所作業が得意で、他の人が尻込みするような場所でも平気な顔。前世は鳥だったのかもしれない。', imagePath: 'assets_mpaid/mpaid26.jpg' },
    { fullName: '藤田 樹', role: 'ベテラン', salary_monthly: 410000, skill_point: 55, stamina: 28, motivation: 22, description: '一度は引退したが、現場の匂いが忘れられず復帰した伝説の職人。孫にはめっぽう弱い。', imagePath: 'assets_mpaid/mpaid27.jpg' },
    { fullName: '小川 陸', role: '多能工', salary_monthly: 345000, skill_point: 39, stamina: 54, motivation: 57, description: 'CADも扱える現場作業員。休日は自分で設計した家具を作っている。そのクオリティは売り物レベル。', imagePath: 'assets_mpaid/mpaid28.jpg' },
    { fullName: '岡田 陽介', role: '職長', salary_monthly: 365000, skill_point: 37, stamina: 61, motivation: 66, description: '元営業職という異色の経歴を持つ。顧客のニーズを的確に把握する能力に長けているが、現場の専門用語に時々戸惑う。', imagePath: 'assets_mpaid/mpaid29.jpg' },
    { fullName: '後藤 匠', role: '若手ホープ', salary_monthly: 265000, skill_point: 25, stamina: 69, motivation: 73, description: 'その名の通り、手先が驚くほど器用。休憩中に、針金で芸術的なオブジェを作ってしまう。', imagePath: 'assets_mpaid/mpaid30.jpg' },
    { fullName: '長谷川 翔', role: '経験者', salary_monthly: 305000, skill_point: 31, stamina: 46, motivation: 49, description: '常に新しい工具や建材の情報をチェックしている勉強家。彼の情報網は、業界新聞よりも早いと評判。', imagePath: 'assets_mpaid/mpaid31.jpg' },
    { fullName: '村上 直人', role: 'ベテラン', salary_monthly: 420000, skill_point: 58, stamina: 26, motivation: 20, description: '昔ながらの職人気質で、口は悪いが腕は超一流。彼に認められることが若手の登竜門となっている。', imagePath: 'assets_mpaid/mpaid32.jpg' },
    { fullName: '近藤 和也', role: '多能工', salary_monthly: 325000, skill_point: 36, stamina: 51, motivation: 54, description: 'DIYが趣味で、その知識と技術を仕事にも活かしている。彼のユニークな発想は、時々現場に革命をもたらす。', imagePath: 'assets_mpaid/mpaid33.jpg' },
    { fullName: '石井 亮太', role: '職長', salary_monthly: 375000, skill_point: 39, stamina: 63, motivation: 67, description: 'メンバーの体調やメンタルにも気を配る、心優しい職長。彼のチームの結束は、コンクリートよりも固い。', imagePath: 'assets_mpaid/mpaid34.jpg' },
    { fullName: '坂本 隼人', role: '若手ホープ', salary_monthly: 275000, skill_point: 27, stamina: 71, motivation: 74, description: '負けず嫌いな性格で、先輩の技術を盗もうと必死。彼の成長スピードは、もはやチートレベル。', imagePath: 'assets_mpaid/mpaid35.jpg' },
    { fullName: '遠藤 彰', role: '経験者', salary_monthly: 290000, skill_point: 28, stamina: 41, motivation: 44, description: '黙々と自分の仕事をこなすタイプ。派手さはないが、彼の堅実な仕事ぶりは、会社の土台を支えている。', imagePath: 'assets_mpaid/mpaid36.jpg' },
    { fullName: '藤井 雄一郎', role: 'ベテラン', salary_monthly: 430000, skill_point: 60, stamina: 24, motivation: 18, description: '業界の重鎮で、彼の名前を知らない者はいない。もはや生ける文化財。その一言は法律よりも重い。', imagePath: 'assets_mpaid/mpaid37.jpg' },
    { fullName: '青木 俊介', role: '多能工', salary_monthly: 360000, skill_point: 41, stamina: 56, motivation: 59, description: '環境問題に関心が高く、エコ建材や省エネ工法に詳しい。マイボトルとマイ箸は常に持参している。', imagePath: 'assets_mpaid/mpaid38.jpg' },
    { fullName: '西村 健', role: '職長', salary_monthly: 380000, skill_point: 40, stamina: 64, motivation: 69, description: '品質管理へのこだわりは人一倍。ミリ単位のズレも見逃さない「鷹の目」を持つ。', imagePath: 'assets_mpaid/mpaid39.jpg' },
    { fullName: '福田 昇', role: '若手ホープ', salary_monthly: 285000, skill_point: 29, stamina: 73, motivation: 76, description: '明るい性格で現場のムードメーカー。彼の周りにはいつも笑い声が絶えないが、笑いすぎてたまに仕事を忘れる。', imagePath: 'assets_mpaid/mpaid40.jpg' },
    { fullName: '太田 浩', role: '経験者', salary_monthly: 315000, skill_point: 33, stamina: 47, motivation: 51, description: 'コスト意識が高く、無駄のない材料の使い方を常に考えている。口癖は「それは経費で落ちるのか？」。', imagePath: 'assets_mpaid/mpaid41.jpg' },
    { fullName: '三浦 智也', role: 'ベテラン', salary_monthly: 440000, skill_point: 62, stamina: 22, motivation: 16, description: '気まぐれで、ふらっと現場からいなくなることがある。しかし、彼が残した仕事は常に完璧。まるで風来坊。', imagePath: 'assets_mpaid/mpaid42.jpg' },
    { fullName: '藤原 潤', role: '多能工', salary_monthly: 355000, skill_point: 40, stamina: 57, motivation: 60, description: 'デザインセンスがあり、内装の提案なども行う。その甘いマスクから、女性の顧客からの指名が絶えない。', imagePath: 'assets_mpaid/mpaid43.jpg' },
    { fullName: '松田 幸雄', role: '職長', salary_monthly: 390000, skill_point: 41, stamina: 65, motivation: 70, description: '「気合と根性」が口癖だが、部下へのフォローは手厚い。アメとムチの使い分けが絶妙な、頼れる親方。', imagePath: 'assets_mpaid/mpaid44.jpg' },
    { fullName: '中川 涼介', role: '若手ホープ', salary_monthly: 295000, skill_point: 30, stamina: 74, motivation: 77, description: 'SNSで自身の仕事ぶりを発信するイマドキの若者。彼の投稿は、なぜかいつも「映え」ている。', imagePath: 'assets_mpaid/mpaid45.jpg' },
    { fullName: '中野 圭', role: '経験者', salary_monthly: 320000, skill_point: 34, stamina: 49, motivation: 53, description: 'チームの和を重んじる調整役。面倒な人間関係のトラブルも、彼の手にかかれば円満解決。', imagePath: 'assets_mpaid/mpaid46.jpg' },
    { fullName: '原田 真一', role: 'ベテラン', salary_monthly: 450000, skill_point: 65, stamina: 20, motivation: 15, description: '社長も頭が上がらない、会社の創業期を支えた大ベテラン。彼の「昔はこうだった」で、全てが覆る。', imagePath: 'assets_mpaid/mpaid47.jpg' },
    { fullName: '小野 拓海', role: '多能工', salary_monthly: 365000, skill_point: 43, stamina: 58, motivation: 61, description: '趣味は筋トレ。その筋肉は現場でも大いに役立っている。彼の腕は、小型のクレーンのようだ。', imagePath: 'assets_mpaid/mpaid48.jpg' },
    { fullName: '田村 晃', role: '職長', salary_monthly: 400000, skill_point: 42, stamina: 66, motivation: 71, description: '複数の現場を同時に管理できるほどのマネジメント能力を持つ。将来の幹部候補と目されているが、極度の方向音痴。', imagePath: 'assets_mpaid/mpaid49.jpg' },
    { fullName: '竹内 俊', role: '若手ホープ', salary_monthly: 300000, skill_point: 31, stamina: 75, motivation: 78, description: '一度見た作業はすぐに覚えてしまう天才肌。そのポテンシャルは、もはや末恐ろしいレベル。', imagePath: 'assets_mpaid/mpaid50.jpg' },
];

export const RECRUIT_CANDIDATES: { free: EmployeeCandidateBase[], paid: EmployeeCandidateBase[], special: EmployeeCandidateBase[] } = {
    free: [
        ...MALE_FREE_CANDIDATES,
        { fullName: "佐藤 さくら", role: "新人スタッフ", salary_monthly: 170000, skill_point: 8, stamina: 68, motivation: 72, description: "持ち前の明るさと高いモチベーションで、現場をパッと華やかにする。細かい作業より勢いで押すタイプだが、そこが魅力でもある。最近、限定版のネコ型ホチキスを探し求めている。", imagePath: "assets_lnonpaid/lnonpaid01.jpg" },
        { fullName: "鈴木 結衣", role: "新人スタッフ", salary_monthly: 180000, skill_point: 12, stamina: 58, motivation: 62, description: "黙々と作業に打ち込む集中力はなかなかのもの。技術も着実に向上中だが、スタミナが課題で長丁場は苦手。休日はジオラマ製作に没頭し、ミリ単位の作業で指先を鍛えているとかいないとか。", imagePath: "assets_lnonpaid/lnonpaid02.jpg" },
        { fullName: "高橋 葵", role: "新人スタッフ", salary_monthly: 160000, skill_point: 5, stamina: 70, motivation: 60, description: "自慢はなんといってもその体力。一日中動き回っても疲れ知らずだ。技術面ではまだまだ成長途中だが、やる気は人一倍。好物はプロテイン。特にバナナ味がお気に入りらしい。", imagePath: "assets_lnonpaid/lnonpaid03.jpg" },
        { fullName: "田中 莉子", role: "新人スタッフ", salary_monthly: 190000, skill_point: 15, stamina: 55, motivation: 68, description: "手先の器用さが光る期待の新人。細やかな気配りもできるが、体力が続かないのが玉にキズで、すぐ息切れする。最新スイーツの情報をSNSでチェックするのが日課。", imagePath: "assets_lnonpaid/lnonpaid04.jpg" },
        { fullName: "渡辺 美咲", role: "新人スタッフ", salary_monthly: 170000, skill_point: 7, stamina: 65, motivation: 70, description: "底抜けの明るさとやる気で、どんな現場もポジティブな雰囲気に変えるムードメーカー。技術はまだまだだが、持ち前のガッツで乗り切る。実は大の演歌好きで、十八番は『天城越え』とのこと。", imagePath: "assets_lnonpaid/lnonpaid05.jpg" },
        { fullName: "伊藤 陽菜", role: "新人スタッフ", salary_monthly: 175000, skill_point: 10, stamina: 62, motivation: 66, description: "柔軟な発想と高いモチベーションが武器。細かい技術はまだ勉強中だが、飲み込みは早い方だ。最近、レトロ建築巡りにはまっているらしい。", imagePath: "assets_lnonpaid/lnonpaid06.jpg" },
        { fullName: "山本 楓", role: "新人スタッフ", salary_monthly: 150000, skill_point: 4, stamina: 68, motivation: 64, description: "どんな仕事にも前向きに取り組む頑張り屋。体力とやる気は十分だが、工具の扱いは少し不器用なのがご愛嬌。夢は自分でデザインしたツリーハウスに住むこと。", imagePath: "assets_lnonpaid/lnonpaid07.jpg" },
        { fullName: "中村 咲", role: "新人スタッフ", salary_monthly: 185000, skill_point: 13, stamina: 59, motivation: 67, description: "真面目でコツコツ努力するタイプ。難しい作業にも粘り強く取り組むが、体力面ではやや不安が残る。飼っているハムスターに「社長」と名付けて可愛がっているそうだ。", imagePath: "assets_lnonpaid/lnonpaid08.jpg" },
        { fullName: "小林 芽依", role: "新人スタッフ", salary_monthly: 170000, skill_point: 9, stamina: 63, motivation: 69, description: "好奇心旺盛で、新しいことを覚えるのが得意。やる気もあるが、おっちょこちょいな一面も。好きな食べ物は、たい焼き。頭から食べるか尻尾から食べるかでいつも悩むらしい。", imagePath: "assets_lnonpaid/lnonpaid09.jpg" },
        { fullName: "加藤 美緒", role: "新人スタッフ", salary_monthly: 165000, skill_point: 6, stamina: 66, motivation: 71, description: "元気印でチームのムードメーカー的存在。やる気に満ち溢れているが、技術はまだまだこれから。仕事終わりのラーメンが何よりの楽しみ。", imagePath: "assets_lnonpaid/lnonpaid10.jpg" },
    ],
    paid: [
        ...MALE_PAID_CANDIDATES,
        { fullName: "佐々木 彩乃", role: "若手社員", salary_monthly: 290000, skill_point: 28, stamina: 55, motivation: 58, description: "一度火がつくと止まらない情熱の持ち主。大きな仕事ほど燃えるタイプだが、地道な細かい作業は少し苦手かもしれない。夢は世界中の名建築を自分の目で見て回ること。", imagePath: "assets_lpaid/lpaid01.jpg" },
        { fullName: "木村 遥", role: "若手社員", salary_monthly: 310000, skill_point: 32, stamina: 50, motivation: 53, description: "計画性と正確な仕事ぶりが光る理論派。技術も確かだが、体力勝負の場面では少し苦戦する傾向がある。最近、苔テラリウムの奥深さにはまっているらしい。", imagePath: "assets_lpaid/lpaid02.jpg" },
        { fullName: "山田 栞", role: "若手社員", salary_monthly: 280000, skill_point: 25, stamina: 58, motivation: 60, description: "「お客様の笑顔第一」を掲げ、常に全力投球。そのモチベーションと体力は素晴らしいが、技術面ではまだ伸びしろあり。週末は保護猫カフェで猫と戯れるのが至福の時。", imagePath: "assets_lpaid/lpaid03.jpg" },
        { fullName: "林 奈々", role: "若手社員", salary_monthly: 320000, skill_point: 35, stamina: 48, motivation: 51, description: "豊富な知識と確かな技術が自慢の資格マニア。ただ、集中しすぎるとスタミナ切れを起こしやすいのが玉にキズ。激辛料理チャレンジが趣味で、新記録更新を目指している。", imagePath: "assets_lpaid/lpaid04.jpg" },
        { fullName: "斎藤 香織", role: "若手社員", salary_monthly: 290000, skill_point: 27, stamina: 56, motivation: 59, description: "美的センスと仕事への情熱が際立つアーティスト気質。美しい仕上がりへのこだわりは人一倍だが、工具の扱いはまだぎこちない。休日は美術館巡りで感性を磨いているそうだ。", imagePath: "assets_lpaid/lpaid05.jpg" },
        { fullName: "清水 優子", role: "若手社員", salary_monthly: 300000, skill_point: 30, stamina: 53, motivation: 55, description: "持ち前の明るさと協調性でチームを引っ張る太陽のような存在。やる気も十分だが、細かい技術より大局観で勝負するタイプ。実はアマチュアバンドのボーカルで、シャウトが得意らしい。", imagePath: "assets_lpaid/lpaid06.jpg" },
        { fullName: "森 あかり", role: "若手社員", salary_monthly: 270000, skill_point: 24, stamina: 59, motivation: 62, description: "新しいことへの探求心が強く、モチベーションは常に最高潮。体力も十分だが、専門スキルはこれから。いつか火星に家を建てるのが夢と豪語するロマンチスト。", imagePath: "assets_lpaid/lpaid07.jpg" },
        { fullName: "池田 恵", role: "若手社員", salary_monthly: 315000, skill_point: 34, stamina: 49, motivation: 52, description: "難題にも果敢に挑む粘り強さと高い技術力が持ち味。ただ、体力面では少し不安があり、無理は禁物。得意な脱出ゲームで鍛えた思考力でカバーする。最近の悩みは、リアル脱出ゲームのチケットがなかなか取れないこと。", imagePath: "assets_lpaid/lpaid08.jpg" },
        { fullName: "橋本 真由", role: "若手社員", salary_monthly: 295000, skill_point: 29, stamina: 57, motivation: 57, description: "体力とやる気は折り紙付き。どんな困難な現場でも最後まで諦めないが、時折おっちょこちょいな一面も。朝低血圧なのが悩みで、毎朝ゾンビのように出社するらしい。", imagePath: "assets_lpaid/lpaid09.jpg" },
        { fullName: "井上 渚", role: "若手社員", salary_monthly: 285000, skill_point: 26, stamina: 60, motivation: 56, description: "自他共に認める体力自慢。どんなハードワークも笑顔でこなすが、手先の器用さはイマイチで、細かい作業は苦手。おばあちゃん特製の巨大おにぎりがパワーの源だとか。", imagePath: "assets_lpaid/lpaid10.jpg" },
    ],
    special: [
         { fullName: "シゲさん", role: "伝説の大工", salary_monthly: 400000, skill_point: 95, stamina: 150, motivation: 80, description: "神業的な技術は右に出る者なし、業界で囁かれる生ける伝説。その巨体から繰り出されるスタミナも底なしだが、気分が乗らないとテコでも動かないのが玉にキズ。好物はワンカップと柿ピー。", imagePath: "assets_mpaid/mpaid51.jpg" },
    ]
};

export const FIRST_NAMES: string[] = ["一郎", "次郎", "三郎", "花子", "恵美"]; // Kept for existing baseName logic

export const GAME_CLEAR_FUNDS = 100000000;
export const GHOST_SHOP_APPEARANCE_CHANCE_NORMAL = 0.05;
export const GHOST_SHOP_APPEARANCE_CHANCE_POST_CLEAR = 0.1;

export const ALL_IMAGE_ASSETS = Array.from(new Set([
    '/assets_start/start(4).jpg',
    ...RECRUIT_CANDIDATES.free.flatMap(c => c.imagePath ? [c.imagePath] : []),
    ...RECRUIT_CANDIDATES.paid.flatMap(c => c.imagePath ? [c.imagePath] : []),
    ...RECRUIT_CANDIDATES.special.flatMap(c => c.imagePath ? [c.imagePath] : []),
]));
