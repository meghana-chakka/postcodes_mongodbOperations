const isValidField = async (label) => {
    try {
        if (
            label &&
            typeof label !== "undefined" &&
            label !== "" && label !== "null" && label !== "NULL"
        ) {
            return label;
        }
        return null;
    } catch (e) {
        return false;
    }
}

module.exports = {
    isValidField
}