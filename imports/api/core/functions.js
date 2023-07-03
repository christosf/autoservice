const convertToSearchableString = input => {
    return input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
}

const convertToSearchableRegex = input => {
    return convertToSearchableString(input).replace(/([()[{*+.$^\\|?])/g, '\\$1')
}

export {
    convertToSearchableString,
    convertToSearchableRegex
}
