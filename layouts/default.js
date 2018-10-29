import Head from 'next/head';
import React, { Component } from 'react';

import "../styles/styles.scss";

class Layout extends Component {
    render() {
        return (            
            <div>
                <Head>
                    <title>Real-time Air Quality (pm2.5) Reports for Some Indian Cities - AQINary</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" rel="stylesheet" />
                </Head>

                {this.props.children}
            </div>
        )
    }
}

export default Layout;