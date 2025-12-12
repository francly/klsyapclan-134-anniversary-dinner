import { useState, useRef, useEffect } from "react";
import { useTasks } from "../context/TaskContext";
import TaskDetailPanel from "../components/TaskDetailPanel";
import TaskTableView from "../components/views/TaskTableView";
import TaskKanbanView from "../components/views/TaskKanbanView";
import TaskGanttView from "../components/views/TaskGanttView";
import { Plus, Circle, CheckCircle2, Star, LayoutGrid, List as ListIcon, Calendar, User, ArrowUpDown, Clock, ChevronRight, Check, Search, Filter, X } from "lucide-react";
import { cn } from "../lib/utils";
import { format, addDays, nextMonday, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function Tasks() {
    const { tasks, addTask, updateTask, deleteTask, addComment } = useTasks();
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterAssignee, setFilterAssignee] = useState("all");
    const [filterRole, setFilterRole] = useState("all"); // Legacy rol-based filter, keep or merge? Let's keep separate for now or merge into assignee group logic.

    // Quick Add State
    const [quickAddTitle, setQuickAddTitle] = useState("");
    const [quickAddDate, setQuickAddDate] = useState(null);
    const [quickAddAssignees, setQuickAddAssignees] = useState([]); // Array for multiple assignees
    const [quickAddPriority, setQuickAddPriority] = useState("medium");

    // UI State
    const [viewMode, setViewMode] = useState("list");
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [activePopover, setActivePopover] = useState(null); // 'date', 'assignee', or null

    const inputRef = useRef(null);
    const datePopoverRef = useRef(null);
    const assigneePopoverRef = useRef(null);

    const [committeeData, setCommitteeData] = useState([]);
    const [allMembers, setAllMembers] = useState([]);

    useEffect(() => {
        fetch('/api/committee')
            .then(res => res.json())
            .then(data => {
                setCommitteeData(data);
                const members = new Set();
                data.forEach(g => {
                    if (g.members && Array.isArray(g.members)) {
                        g.members.forEach(m => members.add(m));
                    }
                });
                setAllMembers(Array.from(members).sort());
            })
            .catch(err => console.error("Failed to load committee", err));
    }, []);

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    // Close popovers when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                datePopoverRef.current && !datePopoverRef.current.contains(event.target) &&
                assigneePopoverRef.current && !assigneePopoverRef.current.contains(event.target) &&
                !event.target.closest('button[data-popover-trigger]')
            ) {
                setActivePopover(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleQuickAdd = (e) => {
        e.preventDefault();
        if (!quickAddTitle.trim()) return;

        addTask({
            title: quickAddTitle,
            description: "",
            assignees: quickAddAssignees,
            dueDate: quickAddDate ? quickAddDate.toISOString() : "",
            priority: quickAddPriority,
        });

        // Reset form
        setQuickAddTitle("");
        setQuickAddDate(null);
        setQuickAddAssignees([]);
        setQuickAddPriority("medium");
        setActivePopover(null);
    };

    const toggleAssignee = (member) => {
        setQuickAddAssignees(prev =>
            prev.includes(member)
                ? prev.filter(m => m !== member)
                : [...prev, member]
        );
    };

    const filteredTasks = tasks.filter(task => {
        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesTitle = task.title.toLowerCase().includes(lowerQuery);
            const matchesDesc = task.description?.toLowerCase().includes(lowerQuery);
            if (!matchesTitle && !matchesDesc) return false;
        }

        // 2. Status Filter
        if (filterStatus !== "all" && task.status !== filterStatus) return false;

        // 3. Priority Filter
        if (filterPriority !== "all" && task.priority !== filterPriority) return false;

        // 4. Assignee Filter
        if (filterAssignee !== "all") {
            const taskAssignees = task.assignees || (task.assignee ? [task.assignee] : []);
            if (!taskAssignees.includes(filterAssignee)) return false;
        }

        // 5. Role Filter (Legacy/Optional - functionality kept for committee structure)
        if (filterRole !== "all") {
            const taskAssignees = task.assignees || (task.assignee ? [task.assignee] : []);
            if (taskAssignees.length === 0) return false;
            const roleMembers = committeeData.find(g => g.role === filterRole)?.members || [];
            return taskAssignees.some(member => roleMembers.includes(member));
        }

        return true;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.status === b.status) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.status === "done" ? 1 : -1;
    });

    // Date Helpers
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const nextWeek = nextMonday(today);

    const setDate = (type) => {
        switch (type) {
            case 'today': setQuickAddDate(today); break;
            case 'tomorrow': setQuickAddDate(tomorrow); break;
            case 'nextWeek': setQuickAddDate(nextWeek); break;
            default: break;
        }
        setActivePopover(null);
    };

    return (
        <div className="flex h-full bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-white transition-colors duration-200">
            {/* Main List Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="px-6 py-4 flex flex-col gap-4 shrink-0 bg-white dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-[#2d2d2d] z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500">Tasks</h1>
                            <span className="text-gray-500 text-lg font-normal ml-2">
                                {filteredTasks.length}
                            </span>
                        </div>
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索任务..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#333] rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-[#333] hidden md:block" />

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-200 text-sm rounded-md px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                            >
                                <option value="all">所有状态</option>
                                <option value="todo">待办</option>
                                <option value="in_progress">进行中</option>
                                <option value="done">已完成</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="flex items-center gap-2">
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-200 text-sm rounded-md px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                            >
                                <option value="all">所有优先级</option>
                                <option value="high">高</option>
                                <option value="medium">中</option>
                                <option value="low">低</option>
                            </select>
                        </div>

                        {/* Assignee Filter */}
                        <div className="flex items-center gap-2">
                            <select
                                value={filterAssignee}
                                onChange={(e) => setFilterAssignee(e.target.value)}
                                className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-200 text-sm rounded-md px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                            >
                                <option value="all">所有负责人</option>
                                {allMembers.map(member => (
                                    <option key={member} value={member}>{member}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all') && (
                            <button
                                onClick={() => {
                                    setFilterStatus('all');
                                    setFilterPriority('all');
                                    setFilterAssignee('all');
                                    setSearchQuery('');
                                }}
                                className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 ml-auto md:ml-0"
                            >
                                <X className="w-3 h-3" />
                                清除筛选
                            </button>
                        )}
                    </div>
                </div>

                {/* Enhanced Quick Add Input */}
                <div className="px-6 py-4 shrink-0">
                    <form
                        onSubmit={handleQuickAdd}
                        className={cn(
                            "relative group bg-white dark:bg-[#1f1f1f] rounded-md shadow-sm ring-1 ring-gray-200 dark:ring-[#333] transition-all",
                            (isInputFocused || quickAddTitle) ? "ring-2 ring-blue-500/50 dark:ring-blue-500/50" : ""
                        )}
                    >
                        <div className="flex items-center px-4 py-3">
                            <div className="text-blue-500 mr-3">
                                <Plus className="w-6 h-6" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={quickAddTitle}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={(e) => {
                                    // Only hide if we're not interacting with popovers
                                    if (!activePopover) {
                                        // setIsInputFocused(false); // Keep focused for better UX
                                    }
                                }}
                                onChange={(e) => setQuickAddTitle(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white placeholder-blue-500/70"
                                placeholder="添加任务..."
                            />
                        </div>

                        {/* Quick Actions Toolbar */}
                        {(quickAddTitle || isInputFocused || activePopover) && (
                            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-[#2d2d2d] bg-gray-50 dark:bg-[#252525] rounded-b-md">
                                <div className="flex items-center gap-2">
                                    {/* Date Picker */}
                                    <div className="relative" ref={datePopoverRef}>
                                        <button
                                            type="button"
                                            data-popover-trigger="date"
                                            onClick={() => setActivePopover(activePopover === 'date' ? null : 'date')}
                                            className={cn(
                                                "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] transition-colors flex items-center gap-1",
                                                (quickAddDate || activePopover === 'date') ? "text-blue-500 bg-blue-50 dark:bg-[#333]" : "text-gray-500 dark:text-gray-400"
                                            )}
                                        >
                                            <Calendar className="w-5 h-5" />
                                            {quickAddDate && <span className="text-xs font-medium">{format(quickAddDate, "MM/dd")}</span>}
                                        </button>

                                        {/* Date Popover */}
                                        {activePopover === 'date' && (
                                            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#2d2d2d] text-center">
                                                    截止日期
                                                </div>
                                                <div className="py-1">
                                                    <button type="button" onClick={() => setDate('today')} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 group/item">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                                                            <span>今天</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">{format(today, "EEE", { locale: zhCN })}</span>
                                                    </button>
                                                    <button type="button" onClick={() => setDate('tomorrow')} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 group/item">
                                                        <div className="flex items-center gap-3">
                                                            <Clock className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                                                            <span>明天</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">{format(tomorrow, "EEE", { locale: zhCN })}</span>
                                                    </button>
                                                    <button type="button" onClick={() => setDate('nextWeek')} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 group/item">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                                                            <span>下周</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">{format(nextWeek, "EEE", { locale: zhCN })}</span>
                                                    </button>
                                                    <div className="border-t border-gray-100 dark:border-[#2d2d2d] mt-1 pt-1">
                                                        <label className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 cursor-pointer group/item relative">
                                                            <div className="flex items-center gap-3">
                                                                <Calendar className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                                                                <span>选择日期</span>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="date"
                                                                onClick={(e) => {
                                                                    try {
                                                                        e.target.showPicker();
                                                                    } catch (err) {
                                                                        // Fallback for browsers that don't support showPicker
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    setQuickAddDate(new Date(e.target.value));
                                                                    setActivePopover(null);
                                                                }}
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assignee Picker (Multiple) */}
                                    <div className="relative" ref={assigneePopoverRef}>
                                        <button
                                            type="button"
                                            data-popover-trigger="assignee"
                                            onClick={() => setActivePopover(activePopover === 'assignee' ? null : 'assignee')}
                                            className={cn(
                                                "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] transition-colors flex items-center gap-1",
                                                (quickAddAssignees.length > 0 || activePopover === 'assignee') ? "text-blue-500 bg-blue-50 dark:bg-[#333]" : "text-gray-500 dark:text-gray-400"
                                            )}
                                        >
                                            <User className="w-5 h-5" />
                                            {quickAddAssignees.length > 0 && (
                                                <span className="text-xs font-medium truncate max-w-[150px]">
                                                    {quickAddAssignees.join(", ")}
                                                </span>
                                            )}
                                        </button>

                                        {/* Assignee Popover */}
                                        {activePopover === 'assignee' && (
                                            <div className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-y-auto bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] rounded-md shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#2d2d2d]">
                                                    指派给... (可多选)
                                                </div>
                                                {committeeData.map(group => (
                                                    <div key={group.role}>
                                                        <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-[#2d2d2d] sticky top-0">{group.role}</div>
                                                        {group.members.map(member => {
                                                            const isSelected = quickAddAssignees.includes(member);
                                                            return (
                                                                <button
                                                                    key={member}
                                                                    type="button"
                                                                    onClick={() => toggleAssignee(member)}
                                                                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs", isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500")}>
                                                                            {member.charAt(0)}
                                                                        </div>
                                                                        <span>{member}</span>
                                                                    </div>
                                                                    {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Priority Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setQuickAddPriority(prev => prev === 'high' ? 'medium' : 'high')}
                                        className={cn(
                                            "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] transition-colors",
                                            quickAddPriority === 'high' ? "text-blue-500 bg-blue-50 dark:bg-[#333]" : "text-gray-500 dark:text-gray-400"
                                        )}
                                    >
                                        <Star className={cn("w-5 h-5", quickAddPriority === 'high' ? "fill-current" : "")} />
                                    </button>
                                </div>
                                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                                    添加
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* View Switcher Tabs */}
                <div className="px-6 border-b border-gray-200 dark:border-[#2d2d2d] flex items-center gap-6">
                    <button
                        onClick={() => setViewMode("table")}
                        className={cn(
                            "py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                            viewMode === "table" || viewMode === "list" // Fallback for legacy state
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        <ListIcon className="w-4 h-4" />
                        Main Table
                    </button>
                    <button
                        onClick={() => setViewMode("kanban")}
                        className={cn(
                            "py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                            viewMode === "kanban"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Kanban
                    </button>
                    <button
                        onClick={() => setViewMode("gantt")}
                        className={cn(
                            "py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                            viewMode === "gantt"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        <Calendar className="w-4 h-4" />
                        Gantt
                    </button>
                </div>

                {/* View Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {(viewMode === "table" || viewMode === "list") && (
                        <TaskTableView
                            tasks={sortedTasks}
                            onTaskClick={setSelectedTaskId}
                            onUpdate={updateTask}
                        />
                    )}
                    {viewMode === "kanban" && (
                        <TaskKanbanView
                            tasks={sortedTasks}
                            onTaskClick={setSelectedTaskId}
                            onUpdate={updateTask}
                        />
                    )}
                    {viewMode === "gantt" && (
                        <TaskGanttView
                            tasks={sortedTasks}
                            onTaskClick={setSelectedTaskId}
                        />
                    )}
                </div>
            </div>

            {/* Detail Panel (Right Side) */}
            {selectedTask && (
                <TaskDetailPanel
                    task={selectedTask}
                    onClose={() => setSelectedTaskId(null)}
                    onUpdate={updateTask}
                    onDelete={(id) => {
                        deleteTask(id);
                        setSelectedTaskId(null);
                    }}
                    onAddComment={addComment}
                    committee={committeeData}
                />
            )}
        </div>
    );
}
