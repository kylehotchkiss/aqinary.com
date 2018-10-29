import cx from 'classnames';
import moment from 'moment';
import React, { Component } from 'react';
import { getLocalMeasurements, getLatestMeasurements } from '../library/measurements.js';

import Layout from '../layouts/default.js';

class Index extends Component {
    constructor( props ) {
        super( props );

        let localMeasurements = null;

        if ( typeof localStorage !== 'undefined' && localStorage.getItem('AQINARY_PREV_MEASUREMENT')) {
            localMeasurements = JSON.parse(localStorage.getItem('AQINARY_PREV_MEASUREMENT'));
        }

        this.state = {
            geoEnabled: null,
            usingRecycledData: null,
            localMeasurements: localMeasurements
        };  
    }

    async componentDidMount() {
        if ( this.state.localMeasurements ) {
            this.setState({
                usingRecycledData: true
            });
        }

        if ( typeof navigator !== undefined && navigator.geolocation ) {           
            const getGeolocation = ( callback ) => {
                console.log('Getting Geolocation...');

                if ( typeof localStorage !== 'undefined' && localStorage.getItem('AQINARY_PREV_LOCATION') ) {
                    console.log('    ...Cached Geolocation received');

                    const location = JSON.parse(localStorage.getItem('AQINARY_PREV_LOCATION'));

                    callback( null, location );
                }

                navigator.geolocation.getCurrentPosition(async ( geo ) => {
                    console.log('    ...Fresh Geolocation received');
                    const { coords: { latitude, longitude } } = geo;

                    if ( typeof localStorage !== 'undefined' ) {
                        localStorage.setItem('AQINARY_PREV_LOCATION', JSON.stringify({ latitude, longitude }));
                    }

                    callback(null, { latitude, longitude });
                }, ( error ) => {
                    console.error( error );
                    callback( error );
                }, {                    
                    timeout: 60000,
                    maximumAge: 6000000, 
                    enableHighAccuracy: false
                });                            
            }

            getGeolocation( async ( error, location ) => {
                if ( !error ) {
                    const latestMeasurements = getLatestMeasurements();

                    const [ aiqData ] = await Promise.all([
                        latestMeasurements
                    ]);

                    const measurements = getLocalMeasurements( aiqData, location.latitude, location.longitude );

                    if ( typeof localStorage !== 'undefined' ) {
                        localStorage.setItem('AQINARY_PREV_MEASUREMENT', JSON.stringify( measurements ));
                    }
                            
                    this.setState({
                        geoEnabled: true,
                        usingRecycledData: false,
                        localMeasurements: measurements
                    });
                }
            });            
        } else if ( !navigator.geolocation ) {
            this.setState({
                geoEnabled: false
            });
        }        
    }

    render() {
        if ( this.state.localMeasurements && this.state.usingRecycledData !== null ) {
            const measurements = this.state.localMeasurements;

            const classnames = cx({
                'aqi-container': true,
                'quality-good': measurements.aqi_pm25 < 100,
                'quality-meh': measurements.aqi_pm25 > 100 && measurements.aqi_pm25 < 200,
                'quality-abysmal': measurements.aqi_pm25 > 200
            });
  
            return (            
                <Layout loaded={ true }>
                    <div className="wrapper">
                        <div className={classnames}>
                            <div className="container">
                                <div className="row">
                                    <div className="col-sm-12 text-center">
                                        <div className="aqi-meta">
                                            Air Quality Index, PM2.5
                                        </div>
                                        <h1 className="aqi-value">
                                            {measurements.aqi_pm25}
                                        </h1>
                                        <div className="aqi-meta">
                                            { measurements.station } &bull; { moment(measurements.updated_at).format('L LT') }
                                        </div>
                                    </div>
                                </div>                    
                            </div>
                        </div>
                    </div>
                </Layout>
            )
        } else if ( this.state.geoEnabled === null ) {
            return (
                <Layout>
                    <div className="aqi-container quality-loading">
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12 text-center">
                                    <em>Please allow the browser to access your location</em>
                                </div>
                            </div>
                        </div>
                    </div>                   
                </Layout>
            );
        } 

        return (
            <Layout>
                <div>Sorry, your browser doesn't support GPS location.</div>
            </Layout>
        );
    }
}

export default Index;