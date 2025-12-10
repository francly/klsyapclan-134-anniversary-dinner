import { useState, useEffect, useRef } from 'react';
import { ClipboardList, Plus, Trash2, Users } from 'lucide-react';
import { rundownData as initialRundownData } from '../data/rundown';

export default function Rundown() {
    const [rundown, setRundown] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [committeeMembers, setCommitteeMembers] = useState([]);
    const saveTimeoutRef = useRef(null);

    // Fetch rundown data
    useEffect(() => {
        console.log('Fetching rundown data...');
        console.log('initialRundownData:', initialRundownData);
        fetch('/api/rundown')
            .then(res => res.json())
            .then(data => {
                console.log('API response:', data);
                // Use fallback data if API returns empty array
                if (!data || data.length === 0) {
                    console.log('Using fallback data');
                    setRundown(initialRundownData);
                } else {
                    console.log('Using API data');
                    setRundown(data);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load rundown data", err);
                console.log('Using fallback data due to error');
                setIsLoading(false);
                setRundown(initialRundownData);
            });
    }, []);

    // Fetch committee members for dropdown
    useEffect(() => {
        fetch('/api/committee')
            .then(res => res.json())
            .then(data => {
                // Extract both member names and positions
                const options = [];
                data.forEach(dept => {
                    // Add Role (Position)
                    if (dept.role && !options.includes(dept.role)) {
                        options.push(dept.role);
                    }
                    // Add Members (Strings)
                    if (Array.isArray(dept.members)) {
                        dept.members.forEach(m => {
                            if (m && typeof m === 'string' && !options.includes(m)) {
                                options.push(m);
                            }
                        });
                    }
                });
                setCommitteeMembers(options.sort());
            })
            .catch(err => console.error("Failed to load committee data", err));
    }, []);

    // Debounced save
    const saveRundown = (newData) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            fetch('/api/rundown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            })
                .then(res => res.json())
                .then(data => console.log("Saved:", data))
                .catch(err => console.error("Save failed:", err));
        }, 1000);
    };

    const handleSlotChange = (dayIndex, slotIndex, field, value) => {
        const newRundown = [...rundown];
        newRundown[dayIndex].slots[slotIndex] = {
            ...newRundown[dayIndex].slots[slotIndex],
            [field]: value
        };
        setRundown(newRundown);
        saveRundown(newRundown);
    };

    const handleDayChange = (dayIndex, field, value) => {
        const newRundown = [...rundown];
        newRundown[dayIndex] = {
            ...newRundown[dayIndex],
            [field]: value
        };
        setRundown(newRundown);
        saveRundown(newRundown);
    };

    const addSlot = (dayIndex) => {
        const newRundown = [...rundown];
        const newId = Math.max(...newRundown.flatMap(d => d.slots.map(s => s.id)), 0) + 1;
        newRundown[dayIndex].slots.push({
            id: newId,
            time: "00:00 - 00:00",
            activity: "新活动",
            responsiblePeople: [],
            remark: ""
        });
        setRundown(newRundown);
        saveRundown(newRundown);
    };

    const deleteSlot = (dayIndex, slotIndex) => {
        if (window.confirm("确定要删除这个活动吗？")) {
            const newRundown = [...rundown];
            newRundown[dayIndex].slots.splice(slotIndex, 1);
            setRundown(newRundown);
            saveRundown(newRundown);
        }
    };

    const handlePersonAdd = (dayIndex, slotIndex, person) => {
        const slot = rundown[dayIndex].slots[slotIndex];
        if (!slot.responsiblePeople.includes(person)) {
            handleSlotChange(dayIndex, slotIndex, 'responsiblePeople',
                [...slot.responsiblePeople, person]
            );
        }
    };

    const handlePersonRemove = (dayIndex, slotIndex, personIndex) => {
        const slot = rundown[dayIndex].slots[slotIndex];
        const newPeople = slot.responsiblePeople.filter((_, i) => i !== personIndex);
        handleSlotChange(dayIndex, slotIndex, 'responsiblePeople', newPeople);
    };

    if (isLoading) return <div className="p-10 text-center">正在加载活动执行清单...</div>;

    console.log('Rendering Rundown Page v1.2');

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111111] transition-colors p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                        <ClipboardList className="w-8 h-8 text-blue-500" />
                        活动执行清单 (Rundown)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        管理详细的活动执行计划、负责人员和备注信息
                    </p>
                </div>

                <div className="space-y-8">
                    {rundown.map((day, dayIndex) => (
                        <div key={dayIndex} className="bg-white dark:bg-[#1f1f1f] rounded-xl shadow-sm border border-gray-100 dark:border-[#2d2d2d] overflow-hidden">
                            {/* Day Header - Editable */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-xl">
                                <input
                                    type="text"
                                    value={day.day}
                                    onChange={(e) => handleDayChange(dayIndex, 'day', e.target.value)}
                                    className="text-2xl font-bold text-white bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none w-full mb-1 transition-colors placeholder-blue-200"
                                    placeholder="输入天数标题 (例如: 第一天...)"
                                />
                                <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                                    <input
                                        type="text"
                                        value={day.date}
                                        onChange={(e) => handleDayChange(dayIndex, 'date', e.target.value)}
                                        className="bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none w-28 text-center transition-colors"
                                        placeholder="日期"
                                    />
                                    <span>•</span>
                                    <span>活动时间:</span>
                                    <input
                                        type="text"
                                        value={day.timeRange}
                                        onChange={(e) => handleDayChange(dayIndex, 'timeRange', e.target.value)}
                                        className="bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none w-32 text-center transition-colors"
                                        placeholder="09:00 - 22:00"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-visible">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-[#333]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-64">
                                                时间 (Start - End)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                                                时长
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                活动详情
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-60">
                                                负责人
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-80">
                                                备注
                                            </th>
                                            <th className="px-6 py-3 w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-[#2d2d2d]">
                                        {day.slots.map((slot, slotIndex) => {
                                            // Parse time range "HH:mm - HH:mm" to start and end
                                            const [startTime, endTime] = slot.time.split(' - ').map(t => t.trim());

                                            const updateTime = (type, newTime) => {
                                                let newRange;
                                                if (type === 'start') newRange = `${newTime} - ${endTime || newTime}`;
                                                else newRange = `${startTime || newTime} - ${newTime}`;
                                                handleSlotChange(dayIndex, slotIndex, 'time', newRange);
                                            };

                                            // Calculate Duration
                                            let duration = "-";
                                            if (startTime && endTime) {
                                                const [startH, startM] = startTime.split(':').map(Number);
                                                const [endH, endM] = endTime.split(':').map(Number);
                                                const startMins = startH * 60 + startM;
                                                const endMins = endH * 60 + endM;
                                                let diff = endMins - startMins;
                                                if (diff < 0) diff += 24 * 60; // Handle next day

                                                const h = Math.floor(diff / 60);
                                                const m = diff % 60;
                                                if (h > 0 && m > 0) duration = `${h}小时${m}分`;
                                                else if (h > 0) duration = `${h}小时`;
                                                else duration = `${m}分钟`;
                                            }

                                            return (
                                                <tr key={slot.id} className="group hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors">
                                                    {/* Time Inputs */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="time"
                                                                value={startTime || ''}
                                                                onChange={(e) => updateTime('start', e.target.value)}
                                                                className="w-24 px-2 py-1 text-sm font-mono text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-[#333] border-transparent focus:border-blue-500 rounded outline-none transition-colors"
                                                            />
                                                            <span className="text-gray-400">-</span>
                                                            <input
                                                                type="time"
                                                                value={endTime || ''}
                                                                onChange={(e) => updateTime('end', e.target.value)}
                                                                className="w-24 px-2 py-1 text-sm font-mono text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-[#333] border-transparent focus:border-blue-500 rounded outline-none transition-colors"
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Duration */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                        {duration}
                                                    </td>

                                                    {/* Activity */}
                                                    <td className="px-6 py-4">
                                                        <textarea
                                                            value={slot.activity}
                                                            onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'activity', e.target.value)}
                                                            rows={2}
                                                            className="w-full px-2 py-1 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-[#444] focus:border-blue-500 rounded outline-none resize-none transition-colors"
                                                        />
                                                    </td>

                                                    {/* Responsible People */}
                                                    <td className="px-6 py-4">
                                                        <ResponsiblePeopleEditor
                                                            people={slot.responsiblePeople}
                                                            suggestions={committeeMembers}
                                                            onAdd={(person) => handlePersonAdd(dayIndex, slotIndex, person)}
                                                            onRemove={(personIndex) => handlePersonRemove(dayIndex, slotIndex, personIndex)}
                                                        />
                                                    </td>

                                                    {/* Remark */}
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={slot.remark}
                                                            onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'remark', e.target.value)}
                                                            placeholder="备注..."
                                                            className="w-full px-2 py-1 text-sm text-gray-600 dark:text-gray-400 bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-[#444] focus:border-blue-500 rounded outline-none transition-colors"
                                                        />
                                                    </td>

                                                    {/* Delete Button */}
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => deleteSlot(dayIndex, slotIndex)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            title="删除"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add Slot Button */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-[#2d2d2d] border-t border-gray-200 dark:border-[#333]">
                                <button
                                    onClick={() => addSlot(dayIndex)}
                                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    添加活动项目
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Responsible People Editor Component with Dropdown
function ResponsiblePeopleEditor({ people, suggestions, onAdd, onRemove }) {
    const [isOpen, setIsOpen] = useState(false);

    // Filter out already selected people
    const availableOptions = suggestions.filter(s => !people.includes(s));

    const handleSelect = (person) => {
        onAdd(person);
        setIsOpen(false);
    };

    return (
        <div className="space-y-2">
            {/* Current People */}
            <div className="flex flex-wrap gap-1.5 align-top">
                {people.length > 0 ? (
                    people.map((person, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                        >
                            <Users className="w-3 h-3" />
                            {person}
                            <button
                                onClick={() => onRemove(index)}
                                className="ml-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                            >
                                ×
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="text-sm text-gray-400 italic py-1">无负责人</span>
                )}
            </div>

            {/* Dropdown Selector */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    className="w-full px-3 py-2 text-sm text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#444] hover:border-blue-500 rounded-lg outline-none transition-colors flex items-center justify-between"
                >
                    <span>添加负责人...</span>
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Menu - Fixed positioning context issue by removing overflow-hidden from parent and using absolute with high z-index */}
                {isOpen && availableOptions.length > 0 && (
                    <div className="absolute z-50 left-0 mt-1 w-64 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#444] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {availableOptions.map((option, index) => (
                            <button
                                key={index}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur before click
                                    handleSelect(option);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border-b border-gray-100 dark:border-[#333] last:border-0"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
                {isOpen && availableOptions.length === 0 && (
                    <div className="absolute z-50 left-0 mt-1 w-full p-2 text-center text-sm text-gray-500 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#444] rounded-lg shadow-xl">
                        无更多选项
                    </div>
                )}
            </div>
        </div>
    );
}
