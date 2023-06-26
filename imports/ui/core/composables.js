export function useCoreReusables() {
    const filterInputDigitsOnly = event => {
        const allowedKeys = ['Backspace', 'Enter', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight']
        const ctrlC = (event.ctrlKey && event.key === 'c') || (event.ctrlKey && event.key === 'C')
        const ctrlV = (event.ctrlKey && event.key === 'v') || (event.ctrlKey && event.key === 'V')

        if ((isNaN(event.key) && !allowedKeys.includes(event.code) && !ctrlC && !ctrlV) || event.code === 'Space') {
            event.preventDefault()
        }
    }

    return {
        filterInputDigitsOnly
    }
}
