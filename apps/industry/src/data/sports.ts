export type Sport = {
  id: string;
  name: string;
  nameEn: string;
  tag: string;
  description: string;
  /** 背景图 URL，或作为 video 的 poster */
  image: string;
  /**
   * 可选背景视频，填 public/ 下的相对路径。
   * 例：video/swimming-1.mp4 → apps/industry/public/video/swimming-1.mp4
   */
  video?: string;
};

export const SPORTS: Sport[] = [
  {
    id: "swimming",
    name: "游泳",
    nameEn: "Swimming",
    tag: "AI · 游泳会员管理",
    description:
      "会员训练数据分析与可视化，提升泳馆运营智能化水平。",
    video: "video/swimming-1.mp4",
    image: "video/swimming-1-cover.png",
  },
  {
    id: "workout",
    name: "健身",
    nameEn: "Workout",
    tag: "AI · 健身会员管理",
    description:
      "会员训练数据分析与可视化，提升健身馆运营智能化水平。",
    video: "video/workout-1.mp4",
    image: "video/workout-1-cover.png",
  },
  {
    id: "billiards",
    name: "台球",
    nameEn: "Billiards",
    tag: "AI · 台球会员与助教管理",
    description:
      "会员数据分析与可视化，助教库运维，提升台球馆运营智能化水平。",
    video: "video/billiards-1.mp4",
    image: "video/billiards-1-cover.png",
  },
  {
    id: "climbing",
    name: "攀岩",
    nameEn: "Climbing",
    tag: "AI · 攀岩会员管理",
    description:
      "会员训练数据分析与可视化，提升攀岩馆运营智能化水平。",
    video: "video/climbing-1.mp4",
    image: "video/climbing-1-cover.png",
  },
  {
    id: "golf",
    name: "高尔夫",
    nameEn: "Golf",
    tag: "AI · 高尔夫会员管理",
    description:
      "会员训练数据分析与可视化，提升高尔夫馆运营智能化水平。",
    video: "video/golf-1.mp4",
    image: "video/golf-1-cover.png",
  },  
  {
    id: "tennis",
    name: "网球",
    nameEn: "Tennis",
    tag: "AI · 网球会员管理",
    description:
      "会员训练数据分析与可视化，提升网球馆运营智能化水平。",
    video: "video/tennis-1.mp4",
    image: "video/tennis-1-cover.png",
  },
  {
    id: "badminton",
    name: "羽毛球",
    nameEn: "Badminton",
    tag: "AI · 羽毛球会员管理",
    description:
      "会员训练数据分析与可视化，提升羽毛球馆运营智能化水平。",
    video: "video/badminton-1.mp4",
    image: "video/badminton-1-cover.png",
  },
];
