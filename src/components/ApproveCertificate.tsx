import * as React from 'react';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';
import { EnergyLogic } from 'ew-origin-contracts-sonnen';

import './CreateSupply.scss'
import { Moment } from 'moment';
import moment = require('moment');

interface Props {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
}

interface State {
    certificateId: number;
    reportedFlexibility: string;
}

export class ApproveCertificate extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            certificateId: -1,
            reportedFlexibility: ''
        };
    }

    async approveCertificate(
        certificateId: number
    ) {
        this.props.conf.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        const energyLogic = new EnergyLogic(
            this.props.conf.blockchainProperties.web3,
            (this.props.conf.blockchainProperties as any).originLogicRegistryAddress
        );

        console.log('OLR', (this.props.conf.blockchainProperties as any).originLogicRegistryAddress);

        await energyLogic.approveCertificate(
            certificateId,
            {
                from: this.props.currentUser.id,
                privateKey: ''
            });
    }

    async getReportedFlexibility(
        certificateId: number
    ) {
        this.setState({
            reportedFlexibility: ''
        });

        this.props.conf.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        const energyLogic = new EnergyLogic(
            this.props.conf.blockchainProperties.web3,
            (this.props.conf.blockchainProperties as any).originLogicRegistryAddress
        );

        let reportedFlexibility = 'Not set';

        try {
            reportedFlexibility = this.parseFlexibility(await energyLogic.getReportedFlexibility(
                certificateId,
                {
                    from: this.props.currentUser.id,
                    privateKey: ''
            }));
        } catch (error) {

        }

        this.setState({
            reportedFlexibility
        });
    }

    parseFlexibility(flexibility): string {
        const information = [];

        if (typeof(flexibility._reportConfirmed) !== 'undefined') {
            information.push(`Report confirmed: ${flexibility._reportConfirmed}`);
        }

        if (typeof(flexibility._energyAmount) !== 'undefined') {
            information.push(`Energy amount: ${flexibility._energyAmount} Wh`);
        }

        if (typeof(flexibility._dateTimeFrom) !== 'undefined') {
            information.push(`Timeframe start: ${moment(flexibility._dateTimeFrom, 'x').format("DD MMM YYYY HH:mm")}`);
        }

        if (typeof(flexibility._dateTimeTo) !== 'undefined') {
            information.push(`Timeframe end: ${moment(flexibility._dateTimeTo, 'x').format("DD MMM YYYY HH:mm")}`);
        }

        if (typeof(flexibility._averagePower) !== 'undefined') {
            information.push(`Average power: ${flexibility._averagePower} Wh`);
        }

        if (typeof(flexibility._activationId) !== 'undefined') {
            information.push(`Activation ID: ${flexibility._activationId}`);
        }

        if (typeof(flexibility._powerProfileURL) !== 'undefined') {
            information.push(`Power profile URL: ${flexibility._powerProfileURL}`);
        }

        if (typeof(flexibility._powerProfileHash) !== 'undefined') {
            information.push(`Power profile hash: ${flexibility._powerProfileHash}`);
        }

        return information.join(`\n`);
    }

    render() {
        const {
            certificateId,
            reportedFlexibility
        } = this.state;

        return <div className='PageWrapper CreateSupply_wrapper'>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ certificateId: parseInt(e.target.value, 10) })} placeholder="Certificate ID (0, 1, 2... etc.)"/>
            <br/><br/>
            <button onClick={() => this.approveCertificate(
                certificateId
            )} className="CreateSupply_button">Approve Certificate</button>
            <hr/>
            <button onClick={() => this.getReportedFlexibility(
                certificateId
            )} className="CreateSupply_button">Get Reported Flexibility</button>
            <br/><br/>
            {reportedFlexibility && <div className="CreateSupply_display">{reportedFlexibility}</div>}
        </div>;

    }

}