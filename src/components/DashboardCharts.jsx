import { useState, useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { Settings, X, ChevronDown, PieChart as PieChartIcon, BarChart as BarChartIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function DashboardCharts({ tasks }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // State
    const [chartType, setChartType] = useState("pie"); // 'pie' | 'bar'
    const [groupBy, setGroupBy] = useState("status"); // 'status' | 'priority' | 'assignee'
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Color Palettes
    const COLORS = {
        status: {
            todo: "#3B82F6", // Blue
            in_progress: "#F97316", // Orange
            done: "#22C55E", // Green
        },
        priority: {
            high: "#EF4444", // Red
            medium: "#F97316", // Orange
            low: "#3B82F6", // Blue
        },
        generic: [
            "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E", "#F97316", "#EAB308", "#22C55E", "#14B8A6"
        ]
    };

    // Data Processing
    const chartData = useMemo(() => {
        if (!tasks.length) return [];

        const counts = {};
        let totalCount = 0;

        tasks.forEach(task => {
            let key = "unknown";

            if (groupBy === "status") {
                key = task.status;
            } else if (groupBy === "priority") {
                key = task.priority;
            } else if (groupBy === "assignee") {
                // Use first assignee or 'Unassigned'
                key = (task.assignees && task.assignees[0]) || (task.assignee) || "Unassigned";
            }

            counts[key] = (counts[key] || 0) + 1;
            totalCount++;
        });

        // Map keys to labels and colors
        return Object.entries(counts).map(([key, value], index) => {
            let label = key;
            let color = COLORS.generic[index % COLORS.generic.length];

            if (groupBy === "status") {
                const labels = { todo: "待办", in_progress: "进行中", done: "已完成" };
                label = labels[key] || key;
                color = COLORS.status[key] || color;
            } else if (groupBy === "priority") {
                const labels = { high: "高优先级", medium: "中优先级", low: "低优先级" };
                label = labels[key] || key;
                color = COLORS.priority[key] || color;
            }

            return {
                name: label,
                value: value,
                percentage: Math.round((value / totalCount) * 100),
                fill: color
            };
        }).sort((a, b) => b.value - a.value); // Sort by count descending
    }, [tasks, groupBy]);

    // Custom Components
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-[#2d2d2d] p-3 border border-gray-100 dark:border-[#333] shadow-xl rounded-lg text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                        {data.value} 个任务 ({data.percentage}%)
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = () => {
        return (
            <div className="flex flex-col justify-center space-y-3 p-4">
                {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {entry.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {entry.value}
                            </span>
                            <span className="text-sm text-gray-400 dark:text-gray-500 w-12 text-right">
                                ({entry.percentage}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (tasks.length === 0) return null;

    return (
        <div className="bg-white dark:bg-[#1f1f1f] rounded-xl shadow-sm border border-gray-100 dark:border-[#2d2d2d] overflow-hidden relative transition-colors duration-200">
            {/* Header */}
            <div className="p-6 pb-2 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">数据分析</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        按 {groupBy === 'status' ? '状态' : groupBy === 'priority' ? '优先级' : '负责人'} 分组
                    </p>
                </div>

                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`p-2 rounded-lg transition-colors ${isSettingsOpen
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8 p-6 pt-2">
                {/* Chart Area */}
                <div className="lg:col-span-2 h-64 lg:h-80 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="90%"
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke={isDark ? "#1f1f1f" : "#fff"}
                                    strokeWidth={3}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        ) : (
                            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#333" : "#f3f4f6"} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={80}
                                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#2d2d2d' : '#f9fafb' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        )}
                    </ResponsiveContainer>

                    {/* Center Text for Pie */}
                    {chartType === 'pie' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend Area */}
                <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-[#2d2d2d]">
                    <CustomLegend />
                </div>
            </div>

            {/* Settings Overlay Pane */}
            {isSettingsOpen && (
                <div className="absolute top-16 right-6 z-20 w-64 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-100 dark:border-[#333] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-[#333]">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">图表设置</span>
                        <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Chart Type Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">图表类型</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setChartType("pie")}
                                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-sm transition-all ${chartType === "pie"
                                            ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                                            : "border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2d2d2d]"
                                        }`}
                                >
                                    <PieChartIcon className="w-4 h-4" />
                                    <span>圆环</span>
                                </button>
                                <button
                                    onClick={() => setChartType("bar")}
                                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-sm transition-all ${chartType === "bar"
                                            ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                                            : "border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2d2d2d]"
                                        }`}
                                >
                                    <BarChartIcon className="w-4 h-4" />
                                    <span>条形</span>
                                </button>
                            </div>
                        </div>

                        {/* Group By Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">分组依据</label>
                            <div className="relative">
                                <select
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="status">任务状态</option>
                                    <option value="priority">优先级</option>
                                    <option value="assignee">负责人</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
