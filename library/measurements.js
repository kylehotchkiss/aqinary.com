import axios from 'axios';
import distance from '@turf/distance';

export const getLatestMeasurements = async () => {
    console.log('Getting latest measurements...');

    try {
        const { data } = await axios.get('https://s3.amazonaws.com/cdn.aqinary.com/measurements/india/aqi.json');

        console.log('    ...Received latest measurements');

        return data;
    } catch ( error ) {
        throw new Error( error );
    }
}

export const getLocalMeasurements = ( aiqData, latitude, longitude ) => {
    for ( const i in aiqData ) {
        const row = aiqData[i];        
        const calculatedDistance = distance([latitude, longitude], [row.latitude, row.longitude]);
        aiqData[i].distance = calculatedDistance;              
    }

    aiqData.sort(( a, b ) => {
        if ( a.distance > b.distance ) {
            return 1;
        } else if ( a.distance < b.distance ) {
            return -1;
        }

        return 0;
    });

    return aiqData[0];
 
}

export default { 
    getLocalMeasurements,
    getLatestMeasurements
}