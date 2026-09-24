// Reference test terminal and vectors (mews/pos Akbank test-suite)
export const AKBANK_TEST = {
  merchantSafeId: '2023090417500272654BD9A49CF07574',
  terminalSafeId: '2023090417500284633D137A249DBBEB',
  secretKey:
    '3230323330393034313735303032363031353172675f357637355f3273387373745f7233725f73323333383737335f323272383774767276327672323531355f',
};

export const AKBANK_3DPAY_CALLBACK = {
  txnCode: '1000',
  responseCode: 'VPS-0000',
  responseMessage: 'BAŞARILI',
  hostResponseCode: '00',
  hostMessage: '000 ONAY KODU XXXXXX',
  txnDateTime: '2024-04-18T20:27:45.000',
  merchantSafeId: AKBANK_TEST.merchantSafeId,
  terminalSafeId: AKBANK_TEST.terminalSafeId,
  cardHolderName: 'TD**',
  orderId: '2024041811DA',
  authCode: '306456',
  rrn: '411024360235',
  batchNumber: '43',
  stan: '86',
  additionalInstallCount: '0',
  deferingMonth: '2',
  ccbEarnedRewardAmount: '0.01',
  ccbBalanceRewardAmount: '215.62',
  ccbRewardDesc: 'CHIP PARA',
  pcbEarnedRewardAmount: '0.00',
  pcbBalanceRewardAmount: '0.00',
  pcbRewardDesc: '',
  xcbEarnedRewardAmount: '0.00',
  xcbBalanceRewardAmount: '0.00',
  xcbRewardDesc: '',
  hashParams:
    'txnCode+responseCode+responseMessage+hostResponseCode+hostMessage+txnDateTime+merchantSafeId+terminalSafeId+orderId+cardHolderName+authCode+rrn+batchNumber+stan+additionalInstallCount+deferingMonth+ccbEarnedRewardAmount+ccbBalanceRewardAmount+ccbRewardDesc+pcbEarnedRewardAmount+pcbBalanceRewardAmount+xcbEarnedRewardAmount+xcbBalanceRewardAmount',
  hash: 'PO/pybfGrY7fesPoAq2U2B1bkpudx659yMyjTnnfP/Cw5MKR1t7mKvRnZdPBxu9nCC7qJFdr3mJSPTdMwYc3SA==',
};
