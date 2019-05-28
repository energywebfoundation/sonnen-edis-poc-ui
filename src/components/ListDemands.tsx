import * as React from 'react';
import * as OriginIssuer from 'ew-origin-lib-sonnen';
import * as EwAsset from 'ew-asset-registry-lib-sonnen'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib-sonnen';
import { OrganizationFilter } from './OrganizationFilter'
import { Table } from '../elements/Table/Table'
import TableUtils from '../elements/utils/TableUtils'
import FadeIn from 'react-fade-in'
import {
    NavLink,
    withRouter
} from 'react-router-dom'
import { MarketLogic } from 'ew-market-contracts-sonnen';

import './CreateSupply.scss'
import moment = require('moment');

interface Props {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
}

interface State {
    demands: any[]
}

export class ListDemands extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            demands: []
        };
    }

    getMarketLogic() {
        return new MarketLogic(
          this.props.conf.blockchainProperties.web3,
          this.props.conf.blockchainProperties.marketLogicInstance.web3Contract._address
        );
      }
    
    async getDemands() {
        const demands = [];
        const marketLogic = this.getMarketLogic();
        const listLength = await marketLogic.getAllDemandListLength();

        for (let i = 0; i < listLength; i++) {
            demands.push(await marketLogic.getDemand(i));
        }

        console.log({
            demands
        })

        return demands;
    }

    async componentDidMount() {
        this.setState({
            demands: await this.getDemands()
        })
    }

    render() {
        const {
            
        } = this.state;

        let total = null
        let totalDemand = 0

        const defaultWidth = 106
        const getKey = TableUtils.getKey
        const generateHeader = (label, width = defaultWidth, right = false, body = false) => (TableUtils.generateHeader(label, width, right, body))
        const generateFooter = TableUtils.generateFooter



        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 5,
            },
            generateFooter('Power in Wh', true)
        ]

        const data = this.state.demands.map((demand, id) => {
            return [
                id,
                demand._regionId,
                moment(demand._dataTimeFrom, 'x').format("DD MMM YYYY HH:mm"),
                moment(demand._dateTimeTo, 'x').format("DD MMM YYYY HH:mm"),
                demand._matchedPower,
                demand._power
            ];
        });

        const TableHeader = [
            generateHeader('Demand ID'),
            generateHeader('Region ID'),
            generateHeader('Timeframe Start Time'),
            generateHeader('Timeframe End Time'),
            generateHeader('Matched Power in Wh'),
            generateHeader('Power in Wh', defaultWidth, true, true)
        ]

        return <div className='ForSaleWrapper'>
            <Table classNames={['bare-font', 'bare-padding']} header={TableHeader} footer={TableFooter} actions={false} data={data} />
        </div>
    }

}