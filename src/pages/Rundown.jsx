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

    // Fetch committee members for autocomplete
    useEffect(() => {
        fetch('/api/committee')
            .then(res => res.json())
            .then(data => {
                // Extract member names from committee data
                const members = data.flatMap(dept =>
                    dept.members.map(m => m.name)
                );
                setCommitteeMembers(members);
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

    console.log('Rendering with rundown:', rundown);
    console.log('Rundown length:', rundown.length);

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
                            {/* Day Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                                <h2 className="text-2xl font-bold">{day.day}</h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    {day.date} • 活动时间: {day.timeRange}
                                </p>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-[#333]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">
                                                时间
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
                                        {day.slots.map((slot, slotIndex) => (
                                            <tr key={slot.id} className="group hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors">
                                                {/* Time */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        value={slot.time}
                                                        onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'time', e.target.value)}
                                                        className="w-full px-2 py-1 text-sm font-mono text-blue-600 dark:text-blue-400 bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-[#444] focus:border-blue-500 rounded outline-none transition-colors"
                                                    />
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
                                        ))}
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

// Responsible People Editor Component with Autocomplete
function ResponsiblePeopleEditor({ people, suggestions, onAdd, onRemove }) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.trim()) {
            const filtered = suggestions.filter(s =>
                s.toLowerCase().includes(value.toLowerCase()) &&
                !people.includes(s)
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleAddPerson = (person) => {
        onAdd(person);
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            handleAddPerson(inputValue.trim());
        }
    };

    return (
        <div className="space-y-2">
            {/* Current People */}
            <div className="flex flex-wrap gap-1.5">
                {people.map((person, index) => (
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
                ))}
            </div>

            {/* Input with Autocomplete */}
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => inputValue && setShowSuggestions(filteredSuggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="添加负责人..."
                    className="w-full px-2 py-1 text-sm text-gray-600 dark:text-gray-400 bg-transparent border border-gray-300 dark:border-[#444] focus:border-blue-500 rounded outline-none transition-colors"
                />

                {/* Autocomplete Dropdown */}
                {showSuggestions && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#444] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleAddPerson(suggestion)}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
