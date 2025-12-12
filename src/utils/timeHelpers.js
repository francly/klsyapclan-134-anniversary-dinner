
// Helper to format 24h time string to 12h AM/PM
export const formatTime12 = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// Helper to get time period (morning, afternoon, evening)
export const getTimePeriod = (timeStr) => {
    if (!timeStr) return "morning"; // default
    const [h] = timeStr.split(':').map(Number);
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    return "evening";
};

export const getPeriodLabel = (period) => {
    switch (period) {
        case "morning": return "上午 (Morning)";
        case "afternoon": return "下午 (Afternoon)";
        case "evening": return "晚上 (Evening)";
        default: return "";
    }
};
