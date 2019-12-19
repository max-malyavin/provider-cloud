import { IWithId, TTransactionWithProofs } from '@waves/ts-types';
import {
    TLong,
    TRANSACTION_TYPE_MAP,
    TTransactionParamWithType,
} from '@waves/waves-js/dist/src/interface';
import { libs, signTx } from '@waves/waves-transactions';
import React from 'react';
import { NAME_MAP } from '../../constants';
import { ISignTxProps, IUserWithBalances } from '../../interface';
import { IState } from '../interface';
import burnPage from '../pages/transactions/burn';
// import exchangePage from '../pages/transactions/exchange';
// import leasePage from '../pages/transactions/lease';
// import cancelLeasePage from '../pages/transactions/cancelLease';
// import aliasPage from '../pages/transactions/alias';
// import massTransferPage from '../pages/transactions/massTransfer';
import dataPage from '../pages/transactions/data';
// import setScriptPage from '../pages/transactions/setScript';
// import sponsorshipPage from '../pages/transactions/sponsorship';
// import setAssetScriptPage from '../pages/transactions/setAssetScript';
import invokePage from '../pages/transactions/invoke';
import issuePage from '../pages/transactions/issue';
import reissuePage from '../pages/transactions/reissue';
import { prepareTransactions } from '../services/transactionsService';
import renderPage from '../utils/renderPage';
import batch from './batch';
import omit from 'ramda/es/omit';
import loader from '../components/loader';
import { SignTransfer } from '../pages/SignTransfer/container';

const getPageByType = (type: keyof TRANSACTION_TYPE_MAP) => {
    switch (type) {
        case NAME_MAP.transfer:
            return SignTransfer;
        case NAME_MAP.exchange:
            throw new Error('Unsupported type!'); // TODO
        case NAME_MAP.lease:
            throw new Error('Unsupported type!'); // TODO
        case NAME_MAP.cancelLease:
            throw new Error('Unsupported type!'); // TODO
        case NAME_MAP.alias:
            throw new Error('Unsupported type!'); // TODO
        case NAME_MAP.massTransfer:
            throw new Error('Unsupported type!'); // TODO
        case NAME_MAP.setScript:
            throw new Error('Unsupported type!'); // TODO
        case NAME_MAP.sponsorship:
            throw new Error('Unsupported type!'); // TODO
        case NAME_MAP.setAssetScript:
            throw new Error('Unsupported type!'); // TODO
        default:
            throw new Error('Unsupported transaction!');
    }
};

export default function(
    list: Array<TTransactionParamWithType>,
    state: IState<IUserWithBalances>
): Promise<Array<TTransactionWithProofs<TLong> & IWithId>> {
    return prepareTransactions(state, list).then((transactions) => {
        if (transactions.length !== 1) {
            return batch(transactions, state);
        }

        const [info] = transactions;

        return new Promise((resolve, reject) => {
            renderPage(
                React.createElement(
                    getPageByType(info.tx.type) as any,
                    {
                        ...info,
                        networkByte: state.networkByte,
                        user: {
                            ...omit(['seed'], state.user),
                            publicKey: libs.crypto.publicKey(state.user.seed),
                        },
                        onConfirm: (transaction) => {
                            resolve(
                                signTx(
                                    transaction as any,
                                    state.user.seed
                                ) as any
                            );
                        },
                        onCancel: () => {
                            reject(new Error('User rejection!'));
                        },
                    } as ISignTxProps<TTransactionParamWithType>
                )
            );
        });
    });
}
