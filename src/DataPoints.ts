
export interface DataPoint {
    color: string,
    description: string ,
    size: number,
    x: number,
};

export function updateDataPoint( updatedPoint:DataPoint, data:DataPoint[]) {
    let filteredData = data.filter( p => p.description !== updatedPoint.description );
    return filteredData.concat( trimDataPoint( updatedPoint ));
}

function trimDataPoint( raw:any ):DataPoint {
    const {color, description, size, x} = raw;
    return Object.assign( {}, {color, description, size, x})
}

export function trimDataPointArray(rawJson:any[]):DataPoint[] {
    return rawJson.map( trimDataPoint );
}

function nameToDataPoint( name:string): DataPoint {
    return {
        description: name,
        color: 'black',
        size: 10,
        x: 0
    }
}

function pick( names:string[], candidates:DataPoint[]) {
    const nameSet = new Set(names);
    return candidates.filter( c => nameSet.has(c.description));
}

function addMissing( names:string[], candidates:DataPoint[] ) {
    const existingNames = new Set( candidates.map( c => c.description ) );
    const missingNames =  names.filter( n => !existingNames.has(n));
    const missingValues = missingNames.map( nameToDataPoint );
    return [ ...missingValues, ...candidates];
}

export function initializeDataPoints( names:string[], candidates:any[] | null) {
    candidates = candidates || [];
    candidates = pick( names, candidates );
    candidates = addMissing( names, candidates );
    candidates = trimDataPointArray(candidates)
    return candidates;

}