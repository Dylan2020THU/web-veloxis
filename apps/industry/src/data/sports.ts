export type Sport = {
  id: string;
  name: string;
  appName: string;
  nameEn: string;
  tag: string;
  description: string;
  archiveItems: string[];
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
    appName: "强化泳迹",
    nameEn: "Swimming",
    tag: "每一次划水，都留下向前的轨迹。",
    description:
      "从第一次完整游完一程，到找到自己的水中节奏。让每一次入水，都成为运动档案里的一段积累。",
    archiveItems: ["每次入水的训练记录", "距离与节奏的点滴变化", "属于自己的水中里程碑"],
    video: "video/swimming-1.mp4",
    image: "video/swimming-1-cover.png",
  },
  {
    id: "workout",
    name: "健身",
    appName: "强化健迹",
    nameEn: "Workout",
    tag: "每一份坚持，都有自己的分量。",
    description:
      "不只关注一次训练的结果，也看见日复一日的坚持。把练习与变化留在档案里，与过去的自己对话。",
    archiveItems: ["每次训练的动作与投入", "训练节奏与状态的变化", "持续坚持的个人印记"],
    video: "video/workout-1.mp4",
    image: "video/workout-1-cover.png",
  },
  {
    id: "billiards",
    name: "台球",
    appName: "强化杆迹",
    nameEn: "Billiards",
    tag: "每一次出杆，都有成长的印记。",
    description:
      "从一杆一杆的练习，到一次次更从容的出手。通过“强化杆迹”小程序，记录训练，回看自己的训练印记。",
    archiveItems: ["每一次练习的训练记录", "日积月累的训练印记", "值得回看的切磋与突破"],
    video: "video/billiards-1.mp4",
    image: "video/billiards-1-cover.png",
  },
  {
    id: "climbing",
    name: "攀岩",
    appName: "强化岩迹",
    nameEn: "Climbing",
    tag: "每一次向上，都算数。",
    description:
      "一次尝试、一条线路、一个新的高度。让攀爬路上的探索与突破，成为属于你的成长轨迹。",
    archiveItems: ["尝试过的线路与练习", "每次攀爬的体验与复盘", "突破自我的高光时刻"],
    video: "video/climbing-1.mp4",
    image: "video/climbing-1-cover.png",
  },
  {
    id: "golf",
    name: "高尔夫",
    appName: "强化挥迹",
    nameEn: "Golf",
    tag: "每一次挥杆，都积累从容。",
    description:
      "练习场上的专注，球道上的思考，都值得被留下。让每一轮经历，成为下一次挥杆的积累。",
    archiveItems: ["挥杆练习与下场经历", "不同球场的个人记忆", "持续复盘的成长轨迹"],
    video: "video/golf-1.mp4",
    image: "video/golf-1-cover.png",
  },
  {
    id: "tennis",
    name: "网球",
    appName: "强化网迹",
    nameEn: "Tennis",
    tag: "每一次回合，都离自己更近。",
    description:
      "从第一次对拉，到一次酣畅淋漓的对局。让训练、回合与突破，在你的运动档案里连成一条线。",
    archiveItems: ["每次上场的训练记录", "值得复盘的对局经历", "从练习到突破的个人历程"],
    video: "video/tennis-1.mp4",
    image: "video/tennis-1-cover.png",
  },
  {
    id: "badminton",
    name: "羽毛球",
    appName: "强化羽迹",
    nameEn: "Badminton",
    tag: "每一次挥拍，都回应你的热爱。",
    description:
      "记住每次挥拍的投入，也记住与球友相遇的时刻。让每一场热爱，都成为可以回看的运动经历。",
    archiveItems: ["日常练球的投入与记录", "与球友切磋的运动经历", "步伐与击球的练习心得"],
    video: "video/badminton-1.mp4",
    image: "video/badminton-1-cover.png",
  },
];
