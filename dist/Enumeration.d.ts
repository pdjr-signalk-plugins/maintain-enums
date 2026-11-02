export declare class Enumeration {
    app: any;
    source: string;
    range: string;
    undefinedValue: number | string;
    map: EnumerationMap[];
    constructor(options: any[], app: any);
}
export type { EnumerationMap };
interface EnumerationMap {
    s: number;
    r: number | string;
}
