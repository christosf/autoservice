const HistoryLogTypesEnum = {
    INSERT: 'insert',
    UPDATE: 'update',
    NOTES_UPDATE: 'notes_update',
    ACTIVATION: 'activation',
    DEACTIVATION: 'deactivation',
    LINK: 'link',
    UNLINK: 'unlink',
    UNLINK_DELETE: 'unlink_delete'
}

Object.freeze(HistoryLogTypesEnum)

export { HistoryLogTypesEnum }
