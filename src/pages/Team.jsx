import { useState, useEffect } from "react";
import { User, Plus, Trash2, Save, X, Edit2 } from "lucide-react";

import Modal from '../components/ui/Modal';

export default function CommitteeManager() {
    const [committee, setCommittee] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Password Modal State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [authError, setAuthError] = useState("");

    // Fetch data
    useEffect(() => {
        fetch('/api/committee')
            .then(res => res.json())
            .then(data => {
                setCommittee(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load committee", err);
                setIsLoading(false);
            });
    }, []);

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === "1892") {
            setIsEditing(true);
            setAuthModalOpen(false);
            setPasswordInput("");
            setAuthError("");
        } else {
            setAuthError("密码错误");
        }
    };

    const toggleEditMode = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            setAuthModalOpen(true);
        }
    };

    // ... group operations ...
    const saveCommittee = async (newData) => {
        try {
            const res = await fetch('/api/committee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            if (!res.ok) throw new Error("Failed to save");
            setCommittee(newData);
            // Optional: Toast success
        } catch (err) {
            console.error("Save failed", err);
            alert("保存失败");
        }
    };

    // Group Operations
    const handleAddGroup = () => {
        const newGroup = { role: "新职位", members: [] };
        const newData = [...committee, newGroup];
        saveCommittee(newData);
    };

    const handleDeleteGroup = (index) => {
        if (!window.confirm("确定要删除这个职位组吗？")) return;
        const newData = committee.filter((_, i) => i !== index);
        saveCommittee(newData);
    };

    const handleUpdateRole = (index, newRole) => {
        const newData = [...committee];
        newData[index].role = newRole;
        saveCommittee(newData);
    };

    // Member Operations
    const handleAddMember = (groupIndex) => {
        const newData = [...committee];
        newData[groupIndex].members.push("新成员");
        saveCommittee(newData);
    };

    const handleUpdateMember = (groupIndex, memberIndex, newName) => {
        const newData = [...committee];
        newData[groupIndex].members[memberIndex] = newName;
        saveCommittee(newData);
    };

    const handleDeleteMember = (groupIndex, memberIndex) => {
        const newData = [...committee];
        newData[groupIndex].members.splice(memberIndex, 1);
        saveCommittee(newData);
    };

    if (isLoading) return <div className="p-10 text-center">加载中...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-white transition-colors">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">筹委会名单</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">管理委员会成员与职位 (CRUD)</p>
                    </div>
                    <button
                        onClick={toggleEditMode}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isEditing
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-[#333] dark:text-gray-300"
                            }`}
                    >
                        {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        {isEditing ? "完成编辑" : "编辑名单"}
                    </button>

                    {/* Password Modal */}
                    <Modal
                        isOpen={authModalOpen}
                        onClose={() => {
                            setAuthModalOpen(false);
                            setPasswordInput("");
                            setAuthError("");
                        }}
                        title="请输入管理员密码"
                    >
                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="输入密码 (1892)"
                                    autoFocus
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#333] border border-gray-200 dark:border-[#444] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                                {authError && <p className="text-red-500 text-sm mt-1">{authError}</p>}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAuthModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    确认
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {committee.map((group, groupIndex) => (
                        <div key={groupIndex} className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm hover:shadow-md transition-all relative group">
                            {/* Role Title */}
                            <div className="mb-4 border-b border-gray-100 dark:border-[#2d2d2d] pb-2 flex justify-between items-center">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={group.role}
                                        onChange={(e) => handleUpdateRole(groupIndex, e.target.value)}
                                        className="text-lg font-semibold bg-gray-50 dark:bg-[#333] border rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{group.role}</h3>
                                )}
                                {isEditing && (
                                    <button onClick={() => handleDeleteGroup(groupIndex)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Members List */}
                            <div className="flex flex-wrap gap-2">
                                {group.members.map((member, memberIndex) => (
                                    <div key={memberIndex} className="flex items-center bg-gray-100 dark:bg-[#2d2d2d] px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                        <User className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={member}
                                                onChange={(e) => handleUpdateMember(groupIndex, memberIndex, e.target.value)}
                                                className="bg-white dark:bg-[#444] border-none outline-none w-20 px-1 rounded"
                                            />
                                        ) : (
                                            <span>{member}</span>
                                        )}
                                        {isEditing && (
                                            <button onClick={() => handleDeleteMember(groupIndex, memberIndex)} className="ml-2 text-gray-400 hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {isEditing && (
                                    <button
                                        onClick={() => handleAddMember(groupIndex)}
                                        className="flex items-center px-3 py-1.5 rounded-lg text-sm border border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> 添加
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Group Button */}
                    {isEditing && (
                        <button
                            onClick={handleAddGroup}
                            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#333] text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors h-full min-h-[200px]"
                        >
                            <Plus className="w-8 h-8 mb-2" />
                            <span className="font-medium">添加新职位组</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
