import { asset, type SportSolutionConfig } from "../components/SportSolution";

/**
 * 全部运动板块统一复用台球的手机截图作占位（确认方案）。
 * 后续替换为各运动专属截图时，只需改这里的 src 路径即可。
 */
const SHOT = {
  heatmap: "billiards/heatmap.png",
  record: "billiards/record.png",
  partner: "billiards/match-partner.png",
  community: "billiards/community.png",
  coach: "billiards/match-coach.png",
  members: "billiards/shop-members.png",
  facility: "billiards/match-table.png",
  login: "billiards/login.png",
} as const;

/** 各运动的术语槽位，喂给 makeSolution 生成同结构、文案各自适配的配置 */
type SportCopy = {
  id: string;
  /** 运动名，如 台球 */
  name: string;
  /** 场馆称呼，如 台球厅 */
  venue: string;
  /** 到店动作动词，如 打球 / 游泳 / 训练 */
  act: string;
  /** “每一X场地”整句，如 每一张台子 */
  facilityEach: string;
  /** 营收单元名，如 台位 / 泳道 / 场地 */
  capacity: string;
  /** 营收口径名，如 台费营收 / 场地营收 */
  capacityRev: string;
  /** 单笔费用名，如 台费 / 场地费 */
  feeNoun: string;
  /** 预约场地（含动词），如 约球桌 */
  bookFacility: string;
  /** 在线预约场地标题，如 在线约球桌 */
  bookFacilityTitle: string;
  /** 预约场地简称，如 约台 / 约场 */
  bookFacilityShort: string;
  /** 锁定单元字，如 台 / 场 / 道 */
  lockUnit: string;
  /** 约搭子（含动词），如 约球友 */
  buddy: string;
  /** 同好称呼，如 玩家 / 球友 / 泳友 */
  peer: string;
  /** 会员角色称呼，如 球员 */
  peerRole: string;
  /** 社交口号，如 以球会友 */
  social: string;
  /** 社区名，如 台球社区 */
  community: string;
  /** 约局角色标签，如 约球 */
  bookLabel: string;
  /** 第四痛点 emoji */
  pain4Emoji: string;
  /** 第四痛点标题，如 台子大把空着 */
  pain4Title: string;
  /** 第四痛点描述 */
  pain4Desc: string;
  /** 闲置场地名词，如 空台 / 空场 */
  empty: string;
  /** 周转率指标名，如 翻台率 / 翻场率 */
  turnover: string;
  /** Hero 背景视频路径 */
  video: string;
  /** Hero 背景视频封面 */
  poster: string;
};

function makeSolution(o: SportCopy): SportSolutionConfig {
  const brand = `强化印记 · ${o.name}`;
  return {
    crumb: o.name,
    badge: `${o.name}门店增长解决方案`,
    brand,
    video: o.video,
    poster: o.poster,
    heroH1: `一套小程序，帮你<span class="text-brand-blue">留住老会员</span>、<span class="text-brand-blue">拉来新会员</span>、<span class="text-brand-blue">盘活教练</span>、<span class="text-brand-blue">填满${o.capacity}</span>`,
    heroSub: `「${brand}」让${o.facilityEach}、每一位教练、每一位会员，都成为 <span class="text-white">可量化、可增长的营收资产</span>。基于微信小程序，开箱即用，会员无需额外下载 App。`,
    loopLine: ["留存", "拉新", "教练营收", o.capacityRev],
    painTitle: `你的${o.venue}，正在漏掉哪些钱？`,
    painIntro: `经营一家${o.venue}，最让人头疼的往往是这四件事。我们把它们拆成四个可落地、可量化的增长动作。`,
    pains: [
      {
        icon: "💳",
        title: "老会员悄悄流失",
        desc: "储值卡躺着不消费，续卡全靠人情。",
      },
      {
        icon: "📈",
        title: "新会员越来越贵",
        desc: "投流获客成本高，到店一次就再不来。",
      },
      {
        icon: "🧑‍🏫",
        title: "教练养着不产出",
        desc: "空档时段没人约，课时费分成上不去。",
      },
      {
        icon: o.pain4Emoji,
        title: o.pain4Title,
        desc: o.pain4Desc,
      },
    ],
    loopTitle: "四步层层递进，后两步直接落到账面营收",
    loopSteps: [
      { step: "01", name: "留存", desc: "打卡习惯 + 数据沉淀，留住老会员" },
      { step: "02", name: "拉新", desc: "社交约局 + 内容传播，社交化获客" },
      {
        step: "03",
        name: "教练营收",
        desc: "闲置时段在线可约，课时直接变现",
        cash: true,
      },
      {
        step: "04",
        name: o.capacityRev,
        desc: `在线${o.bookFacilityShort} + 拼场，盘活${o.empty}时段`,
        cash: true,
      },
    ],
    points: [
      {
        no: "一",
        kicker: "高粘黏 · 留住老会员",
        title: `把“偶尔来${o.act}”变成“天天惦记来打卡”`,
        claim:
          "用打卡习惯和训练数据沉淀，让老会员舍不得走、续卡停不下来——来得越勤，储值卡核销越快，资金回笼越快。",
        features: [
          "<b>训练打卡热力图</b>（GitHub 风格 53 周 × 7 天）+ 连续打卡天数，习惯养成机制驱动高频到店",
          "<b>训练记录沉淀</b>：场馆、时长按天累积，数据资产越多越舍不得流失",
          `<b>${o.community}</b>：把“消费关系”升级为“社区归属感”`,
        ],
        metrics: [
          { label: "续卡率 / 复购率", dir: "up" },
          { label: "到店频次", dir: "up" },
          { label: "会员流失率", dir: "down" },
          { label: "会员 LTV", dir: "up" },
        ],
        shots: [
          { src: asset(SHOT.heatmap), alt: `${o.name}训练打卡热力图` },
          { src: asset(SHOT.record), alt: "记录一次训练" },
        ],
        heatmap: true,
      },
      {
        no: "二",
        kicker: "高传播 · 社交化拉新",
        title: `${o.peer}带${o.peer}，让会员成为你的“编外推广员”`,
        claim: `${o.social}、内容自传播，用更低的成本带来更多新客——一次约局往往带动 2~4 人到店，新朋友顺势转化为新会员。`,
        features: [
          `<b>${o.buddy}</b>：在线发起邀约，其他${o.peer}报名拼场，自然带新到店`,
          `<b>${o.community}笔记</b>：战绩、训练视频发成图文/视频，向社交圈外传播，门店获得曝光`,
          `<b>关注机制</b>：优质教练、活跃${o.peer}成为内容节点，持续吸引新用户`,
        ],
        metrics: [
          { label: "新增会员数", dir: "up" },
          { label: "单客获客成本", dir: "down" },
          { label: "老带新转化率", dir: "up" },
          { label: "门店线上曝光", dir: "up" },
        ],
        shots: [
          { src: asset(SHOT.partner), alt: `${o.buddy}拼场` },
          { src: asset(SHOT.community), alt: `${o.community}笔记` },
        ],
        reversed: true,
      },
      {
        no: "三",
        kicker: "盘活教练 · 课时变现",
        title: "把“养着的教练”变成“产课时费的利润单元”",
        claim:
          "让教练的闲置时段在线可约、教学按数据说话，把教练资源变成持续产出营收的利润单元。",
        features: [
          "<b>在线约教练</b>：自助设置可约时段、按分钟/课时定价，会员直接下单，空档直接变现",
          "<b>学员训练数据</b>：教练查看绑定学员热力图与明细（带授权校验），按数据教学",
          "<b>教练花名册 + 会员训练统计</b>：店主端集中管理、课时产出可视化，便于考核分成",
        ],
        metrics: [
          { label: "教练上座率", dir: "up" },
          { label: "课时营收及分成", dir: "up" },
          { label: "私教转化率", dir: "up" },
          { label: "教练人效", dir: "up" },
        ],
        shots: [
          { src: asset(SHOT.coach), alt: "在线约教练" },
          { src: asset(SHOT.members), alt: "会员训练统计" },
        ],
      },
      {
        no: "四",
        kicker: `填满${o.capacity} · 盘活${o.empty}`,
        title: `把“闲置${o.capacity}”变成营收`,
        claim: `用约局社交 + 在线${o.bookFacilityShort}，主动盘活工作日下午、深夜这些“死时段”的${o.empty}，提升整体上座率与${o.turnover}。`,
        features: [
          `<b>${o.bookFacilityTitle}</b>：选场馆、选时段直接${o.bookFacilityShort}，把“路过才消费”变成“提前锁${o.lockUnit}消费”`,
          `<b>${o.buddy}拼场</b>：一个约局直接转化成多份${o.feeNoun} + 饮品消费，主动填补非高峰`,
          `<b>高频打卡到店</b>：稳定的到店习惯，天然填补${o.capacity}空档`,
        ],
        metrics: [
          { label: "上座率", dir: "up" },
          { label: o.turnover, dir: "up" },
          { label: "坪效 / 时段产值", dir: "up" },
          { label: "临时客转预约客", dir: "up" },
        ],
        shots: [{ src: asset(SHOT.facility), alt: o.bookFacilityTitle }],
        reversed: true,
      },
    ],
    summaryTitle: "店主的收益闭环",
    summaryRows: [
      ["一 · 高粘黏留存", "老会员留不住", "续卡率、到店频次、流失率"],
      ["二 · 高传播获客", "新会员进不来、太贵", "获客成本、新增会员数"],
      ["三 · 盘活教练", "教练养着不产出", "课时营收/分成、教练上座率"],
      [
        `四 · 填满${o.capacity}`,
        `${o.empty}时段净亏损`,
        `上座率、${o.turnover}、坪效`,
      ],
    ],
    rolesTitle: `一套系统，服务${o.peerRole}、教练、店主`,
    rolesIntro:
      "登录即选择身份，进入与角色匹配的专属工作台，数据严格隔离。基于微信小程序，无需会员额外下载 App。",
    roleGroups: [
      { role: "会员端", items: "训练打卡热力图、训练记录、连续打卡统计" },
      {
        role: "教练端",
        items: "资料认证、可约时段、定价、学员数据、课时预约管理",
      },
      {
        role: "店主端",
        items: "店铺信息、教练花名册、会员训练统计（打卡天数 / 时长排行）",
      },
      { role: "社区", items: "图文/视频笔记、信息流、点赞、评论、关注" },
      {
        role: o.bookLabel,
        items: `${o.buddy}、约教练、${o.bookFacility}`,
      },
    ],
    loginShot: { src: asset(SHOT.login), alt: `${brand} 登录身份选择界面` },
    ctaTitle: `让${o.name}门店的每一份资源都在增长`,
    ctaText: `「${brand}」基于微信小程序，开箱即用，无需会员额外下载 App。欢迎联系大川激流，预约一场面向你门店的现场演示。`,
  };
}

export const SPORT_SOLUTIONS: Record<string, SportSolutionConfig> = {
  billiards: makeSolution({
    id: "billiards",
    name: "台球",
    venue: "台球厅",
    act: "打球",
    facilityEach: "每一张台子",
    capacity: "台位",
    capacityRev: "台费营收",
    feeNoun: "台费",
    bookFacility: "约球桌",
    bookFacilityTitle: "在线约球桌",
    bookFacilityShort: "约台",
    lockUnit: "台",
    buddy: "约球友",
    peer: "玩家",
    peerRole: "球员",
    social: "以球会友",
    community: "台球社区",
    bookLabel: "约球",
    pain4Emoji: "🎱",
    pain4Title: "台子大把空着",
    pain4Desc: "工作日下午、深夜的空台，每分钟都是净亏损。",
    empty: "空台",
    turnover: "翻台率",
    video: "video/billiards-1.mp4",
    poster: "video/billiards-1-cover.png",
  }),
  swimming: makeSolution({
    id: "swimming",
    name: "游泳",
    venue: "泳馆",
    act: "游泳",
    facilityEach: "每一条泳道",
    capacity: "泳道",
    capacityRev: "水道营收",
    feeNoun: "水道费",
    bookFacility: "约泳道",
    bookFacilityTitle: "在线约泳道",
    bookFacilityShort: "约道",
    lockUnit: "道",
    buddy: "约泳友",
    peer: "泳友",
    peerRole: "泳者",
    social: "以泳会友",
    community: "游泳社区",
    bookLabel: "约泳",
    pain4Emoji: "🏊",
    pain4Title: "泳道大把空着",
    pain4Desc: "工作日下午、夜间的空泳道，每分钟都是净亏损。",
    empty: "空泳道",
    turnover: "泳道周转率",
    video: "video/swimming-1.mp4",
    poster: "video/swimming-1-cover.png",
  }),
  workout: makeSolution({
    id: "workout",
    name: "健身",
    venue: "健身房",
    act: "训练",
    facilityEach: "每一节团课、每一台器械",
    capacity: "团课与器械时段",
    capacityRev: "团课营收",
    feeNoun: "团课/私教费",
    bookFacility: "约团课",
    bookFacilityTitle: "在线约团课",
    bookFacilityShort: "约课",
    lockUnit: "课",
    buddy: "约搭子",
    peer: "会员",
    peerRole: "会员",
    social: "以练会友",
    community: "健身社区",
    bookLabel: "约练",
    pain4Emoji: "🏋️",
    pain4Title: "团课器械时段闲置",
    pain4Desc: "工作日白天、深夜的空团课与器械，每分钟都是净亏损。",
    empty: "空档",
    turnover: "团课满员率",
    video: "video/workout-1.mp4",
    poster: "video/workout-1-cover.png",
  }),
  climbing: makeSolution({
    id: "climbing",
    name: "攀岩",
    venue: "岩馆",
    act: "攀岩",
    facilityEach: "每一条岩道",
    capacity: "岩道时段",
    capacityRev: "岩道营收",
    feeNoun: "岩道/次卡费",
    bookFacility: "约岩道",
    bookFacilityTitle: "在线约岩道",
    bookFacilityShort: "约道",
    lockUnit: "道",
    buddy: "约岩友",
    peer: "岩友",
    peerRole: "岩友",
    social: "以岩会友",
    community: "攀岩社区",
    bookLabel: "约岩",
    pain4Emoji: "🧗",
    pain4Title: "岩道大把空着",
    pain4Desc: "工作日下午、深夜的空岩道，每分钟都是净亏损。",
    empty: "空岩道",
    turnover: "岩道周转率",
    video: "video/climbing-1.mp4",
    poster: "video/climbing-1-cover.png",
  }),
  golf: makeSolution({
    id: "golf",
    name: "高尔夫",
    venue: "高尔夫练习场",
    act: "打球",
    facilityEach: "每一个打位",
    capacity: "打位",
    capacityRev: "打位营收",
    feeNoun: "打位费",
    bookFacility: "约打位",
    bookFacilityTitle: "在线约打位",
    bookFacilityShort: "约位",
    lockUnit: "位",
    buddy: "约球友",
    peer: "球友",
    peerRole: "球友",
    social: "以球会友",
    community: "高尔夫社区",
    bookLabel: "约球",
    pain4Emoji: "⛳",
    pain4Title: "打位大把空着",
    pain4Desc: "工作日下午、夜间的空打位，每分钟都是净亏损。",
    empty: "空打位",
    turnover: "打位周转率",
    video: "video/golf-1.mp4",
    poster: "video/golf-1-cover.png",
  }),
  tennis: makeSolution({
    id: "tennis",
    name: "网球",
    venue: "网球馆",
    act: "打球",
    facilityEach: "每一片球场",
    capacity: "场地",
    capacityRev: "场地营收",
    feeNoun: "场地费",
    bookFacility: "约场地",
    bookFacilityTitle: "在线约场地",
    bookFacilityShort: "约场",
    lockUnit: "场",
    buddy: "约球友",
    peer: "球友",
    peerRole: "球员",
    social: "以球会友",
    community: "网球社区",
    bookLabel: "约球",
    pain4Emoji: "🎾",
    pain4Title: "球场大把空着",
    pain4Desc: "工作日下午、夜间的空场，每分钟都是净亏损。",
    empty: "空场",
    turnover: "翻场率",
    video: "video/tennis-1.mp4",
    poster: "video/tennis-1-cover.png",
  }),
  badminton: makeSolution({
    id: "badminton",
    name: "羽毛球",
    venue: "羽毛球馆",
    act: "打球",
    facilityEach: "每一片球场",
    capacity: "场地",
    capacityRev: "场地营收",
    feeNoun: "场地费",
    bookFacility: "约场地",
    bookFacilityTitle: "在线约场地",
    bookFacilityShort: "约场",
    lockUnit: "场",
    buddy: "约球友",
    peer: "球友",
    peerRole: "球员",
    social: "以球会友",
    community: "羽毛球社区",
    bookLabel: "约球",
    pain4Emoji: "🏸",
    pain4Title: "球场大把空着",
    pain4Desc: "工作日下午、夜间的空场，每分钟都是净亏损。",
    empty: "空场",
    turnover: "翻场率",
    video: "video/badminton-1.mp4",
    poster: "video/badminton-1-cover.png",
  }),
};
