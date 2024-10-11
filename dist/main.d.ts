type Status = {
    Status: string;
    Error?: string;
    Data?: any;
};
declare const _default: {
    getValue: (path: string, key: string) => Promise<any>;
    getValueSync: (path: string, key: string) => Status;
    getAllValues: (path: string) => Promise<any>;
    getAllValuesSync: (path: string, key: string) => Status;
};
export default _default;
