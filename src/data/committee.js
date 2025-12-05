export const committee = [
    { role: "大会主席", members: ["金明"] },
    { role: "大会副主席", members: ["观发", "端强"] },
    { role: "筹委会主席", members: ["贵华"] },
    { role: "筹委会副主席", members: ["文生", "其富", "拿督运财"] },
    { role: "总策划", members: ["健忠"] },
    { role: "副总策划", members: ["育琴"] },
    { role: "秘书", members: ["国汉", "毓腾"] },
    { role: "副秘书", members: ["秀琴"] },
    { role: "报到处", members: ["秀琴", "明丽", "碧君"] },
    { role: "财政", members: ["秋萍"] },
    { role: "副财政", members: ["宥胜", "春年"] },
    { role: "征求组", members: ["三机构理事"] },
    { role: "票务组", members: ["汶祥", "建良"] },
    { role: "招待/接待", members: ["碧清", "映雪"] },
    { role: "特刊小组", members: ["志行", "立勤", "国汉"] },
    { role: "台前/幕后", members: ["志勤", "家辉", "松林", "青年团"] },
    { role: "礼品", members: ["家秀"] },
    { role: "节目组", members: ["雪仪", "丽霞", "文杰"] },
    { role: "司仪", members: ["碧琴"] },
    { role: "音响/银幕设计", members: ["志行"] },
    { role: "场地/布置组", members: ["青年团及妇女组"] },
    { role: "催场/酒水", members: ["思福", "进财", "燕清"] },
    { role: "机场接待", members: ["其富", "端強", "財发", "进財"] },
    { role: "住宿/膳食", members: ["碧清", "妇女组"] },
    { role: "摄影", members: ["丽霞"] },
    { role: "委员", members: ["金来", "志雄", "顺昌", "耀伦", "惠容", "貴荣"] },
    { role: "查账", members: ["月兰", "顺兰"] }
];

export const getAllMembers = () => {
    const members = new Set();
    committee.forEach(group => {
        group.members.forEach(member => members.add(member));
    });
    return Array.from(members);
};
