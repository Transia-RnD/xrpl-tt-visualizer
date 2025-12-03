import React, { useState } from "react";
import JsonTextArea from "./utils/JsonTextArea";
import HookTextArea from "./utils/HookTextArea";
import { encode } from "xahau";
import { DEFAULT_DEFINITIONS } from "xahau-binary-codec";

function formatHexString(hexString: string): string {
  // Pad the string with leading zeros if it's not an even length
  if (hexString.length % 2 !== 0) {
      hexString = '0' + hexString;
  }

  // Split the string into pairs of two characters
  const pairs = hexString.match(/.{1,2}/g);

  // Format each pair as "0xXXU"
  const formattedPairs = pairs?.map(pair => `0x${pair.toUpperCase()}U`);

  // Join the formatted pairs with a comma and a space
  return formattedPairs?.join(', ') + ',';
}

function formatAbbrv(value: string, type: string): string {
  switch (type) {
    case 'TransactionType':
      return `tt = ${value}`
    default:
      return type.toLowerCase()
  }
}

function formatEmptyType(field: string, type: string, encoded: string): string {
  switch (type) {
    case 'AccountID':
      return `${formatHexString(encoded.slice(0, 4))} 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
    case 'Amount':
      switch (field) {
        case 'Fee':
          return `${formatHexString(encoded.slice(0, 4))} 0x00U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U,`
        default:
          return `${formatHexString(encoded.slice(0, 2))} 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U,`
      }
    case 'Blob':
      return `${formatHexString(encoded.slice(0, 4))} 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
    case 'Hash256':
      return `${formatHexString(encoded.slice(0, 4))} 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
    case 'SigningPubKey':
      return `0x73U, 0x21U, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
    default:
      switch (field) {
        case 'DestinationTag':
          return `0x99U, 0x99U, 0x99U, 0x99U, 0x99U,`
        default:
          return formatHexString(encoded)
      }
  }
}

function formatField(value: string, field: string, type: string, byteLength: string, offset: string, encoded: string): string {
  let abbrv = formatAbbrv(value, field)
  abbrv += " ".padEnd(24 - (abbrv.length + String(byteLength).length + String(offset).length))
  return `/* ${byteLength},  ${offset}, ${abbrv} */   ${formatEmptyType(field, type, encoded)}\n`
}

function addDefaultFields(jsonData: any): any {
  // Define default values for the fields
  const defaults = {
    Flags: 0,
    Sequence: 0,
    FirstLedgerSequence: 0,
    LastLedgerSequence: 0,
    Fee: '0',
    SigningPubKey: '000000000000000000000000000000000000000000000000000000000000000000',
    Account: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
  };
  if (jsonData.Destination) {
    // @ts-ignore
    defaults['DestinationTag'] = 0
  }

  // Create a new object to hold the sorted fields
  const sortedJsonData: any = {};

  // Add fields from approveList in order, using values from jsonData or defaults
  approveList.forEach((field) => {
    if (jsonData.hasOwnProperty(field)) {
      sortedJsonData[field] = jsonData[field];
    } else if (defaults.hasOwnProperty(field)) {
      // @ts-ignore
      sortedJsonData[field] = defaults[field];
    }
  });

  // Add any additional fields from jsonData that are not in approveList
  Object.keys(jsonData).forEach((key) => {
    if (!sortedJsonData.hasOwnProperty(key)) {
      sortedJsonData[key] = jsonData[key];
    }
  });

  return sortedJsonData;
}

function abbreviateCamelCase(variableName: string, limit: number = 4): string {
  // If the variable name is less than 6 characters, uppercase the whole word and append "_OUT"
  if (variableName.length <= 7) {
    return variableName.toUpperCase() + "_OUT";
  }

  switch (variableName) {
    case 'TransactionType':
      return "TT_OUT";
    case 'Destination':
      return "DEST_OUT";
    case 'DestinationTag':
      return "DTAG_OUT";
    case 'SourceTag':
      return "STAG_OUT";
    case 'FirstLedgerSequence':
      return "FLS_OUT";
    case 'LastLedgerSequence':
      return "LLS_OUT";
    case 'CheckID':
      return "ID_OUT";
    case 'Expiration':
      return "EXP_OUT";
    case 'InvoiceID':
      return "INV_ID_OUT";
    case 'EscrowID':
      return "ID_OUT";
    case 'DeliverMin':
      return "DMIN_OUT";
    case 'Authorize':
      return "AUTH_OUT";
    case 'Unauthorize':
      return "UNAUTH_OUT";
    case 'OfferSequence':
      return "OFF_SEQ_OUT";
    case 'CancelAfter':
      return "CAN_AFT_OUT";
    case 'FinishAfter':
      return "FIN_AFT_OUT";
    case 'Condition':
      return "COND_OUT";
    case 'Fulfillment':
      return "FULFILL_OUT";
    case 'TakerGets':
      return "T_GETS_OUT";
    case 'TakerPays':
      return "T_PAYS_OUT";
    case 'Signature':
      return "SIG_OUT";
    case 'PublicKey':
      return "PK_OUT";
    case 'SettleDelay':
      return "SETDLAY_OUT";
    case 'RegularKey':
      return "RKEY_OUT";
    case 'SignerQuorum':
      return "QUORUM_OUT";
    case 'SignerEntries':
      return "ENTRIES_OUT";
    case 'TicketCount':
      return "TCOUNT_OUT";
    case 'LimitAmount':
      return "LAMT_OUT";
    case 'QualityIn':
      return "QIN_OUT";
    case 'QualityOut':
      return "QOUT_OUT";
    case 'URITokenID':
      return "ID_OUT";
    case 'EmitDetails':
      return "EMIT_OUT";
    default:
      return "_OUT";
  }
}

const nonApproveList = [
  'TransactionType',
  'Sequence',
  'SigningPubKey',
]
const approveList = [
  'TransactionType',
  'Flags',
  'Sequence',
  'DestinationTag',
  'SourceTag',
  'FirstLedgerSequence',
  'LastLedgerSequence',
  // Hash256
  'CheckID', // CheckCancel
  'InvoiceID', // CheckCreate
  'Channel', // PaymentChannelClaim
  'URITokenID', // URITokenBurn
  'OfferSequence', // EscrowCancel
  'Expiration', // CheckCreate
  'CancelAfter', // EscrowCreate
  'FinishAfter', // EscrowCreate
  'Condition', // EscrowCreate
  'Fulfillment', // EscrowFinish
  'Signature', // PaymentChannelClaim
  'PublicKey', // PaymentChannelClaim
  'SettleDelay', // PaymentChannelCreate
  'Hooks', // SetHook
  'SignerQuorum', // SignerListSet
  'SignerEntries', // SignerListSet
  'TicketCount', // TicketCreate
  'QualityIn', // TrustSet
  'QualityOut', // TrustSet
  // Amount
  'Amount',
  'LimitAmount', // TrustSet
  'DeliverMin', // CheckCash
  'SendMax', // CheckCreate
  'TakerGets', // OfferCreate
  'TakerPays', // OfferCreate
  'Balance', // PaymentChannelClaim
  'Fee',
  'SigningPubKey',
  // AccountID
  'Account',
  'Destination',
  'Issuer', // ClaimReward
  'Authorize', // DepositPreauth
  'Unauthorize', // DepositPreauth
  'Owner', // EscrowCancel
  'RegularKey', // SetRegularKey
  // VL
  'URI', // URITokenMint
  'Digest', // URITokenMint
  'Blob', // Import
  'Paths', // Payment
  'EmitDetails',
]
function addToMacroDict(field: string, type: string, offset: number): any {  
  if (approveList.includes(field) && !nonApproveList.includes(field)) {
    return {
      name: abbreviateCamelCase(field),
      offset: offset + additionalOffset(field, type),
      arg: `${camelToSnake(field)}`
    }
  }
}

function additionalOffset(field: string, type: string): any {
  switch (type) {
    case 'Amount':
      if (field === 'Fee') {
        return 1;
      }
      return 0;
    case 'STArray':
      if (field === 'EmitDetails') {
        return 0;
      }
      return 2;
    case 'UInt32':
      if (field === 'Flags') {
        return 1;
      }
      return 2;
    default:
      return 2;
  }
}

const omitList = [
  'Fee',
  'EmitDetails',
  'FirstLedgerSequence',
  'LastLedgerSequence',
  'Flags',
]

const float48 = (type_out: string, type: string, currency: string, issuer: string, amount: string) => {
  return `    float_sto(${type_out}, 49, ${currency}, 20, ${issuer}, 20, ${amount}, sf${type}); \\ \n`
}

function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, (match) => `${match.toLowerCase()}`);
}

function getAdditionalArgs(field:string, flags: number): any {
  switch (field) {
    case 'Account':
      return ['account_buffer']
    case 'LimitAmount':
      return ['currency_buffer', 'issuer_buffer', 'amount_xfl']
    case 'TakerGets':
      if (flags === 1) {
        return ['xah_xfl']
      }
      return ['currency_buffer', 'issuer_buffer', 'amount_xfl']
    case 'TakerPays':
      if (flags === 0) {
        return ['xah_xfl']
      }
      return ['currency_buffer', 'issuer_buffer', 'amount_xfl']
    default:
      return null;
  }
}

console.log(getAdditionalArgs('TakerPays', 0));


function parseApiType(out: string, field:string): any {
  switch (field) {
    case 'Account':
      return `    ACCOUNT_TO_BUF(${out}, account_buffer); \\ \n`
    case 'LimitAmount':
      return float48(out, field, 'currency_buffer', 'issuer_buffer', 'amount_xfl')
    case 'TakerGets':
      return float48(out, field, 'currency_buffer', 'issuer_buffer', 'amount_xfl')
    case 'TakerPays':
      return float48(out, field, 'currency_buffer', 'issuer_buffer', 'amount_xfl')
    default:
      return null;
  }
}

const HexConversion: React.FC = () => {
  const [hexOutput, setHexOutput] = useState<string>("");
  const handleOnConvert = (json: any) => {
    const jsonData = addDefaultFields(JSON.parse(json))
    let macroDict: any = {}
    let byteTotal = 0
    let offset = 0
    const tarray: string[] = []
    Object.keys(jsonData).forEach((key) => {
      // Perform any additional processing with the key and value here
      const _json = {} as any
      _json[key] = jsonData[key]
      const encoded = encode(_json)

      // @ts-ignore
      const field = DEFAULT_DEFINITIONS.field[key as string].name
      // @ts-ignore
      const type = DEFAULT_DEFINITIONS.field[key as string].type.name

      const byteLength = encoded.length / 2

      // @ts-ignore
      tarray.push(formatField(jsonData[key], field, type, byteLength, offset, encoded))
      
      const result = addToMacroDict(field, type, offset)
      if (result) {
        macroDict[field] = result
      }

      byteTotal += byteLength
      offset += byteLength
    });

    const emitTotal = 116

    byteTotal += emitTotal
    
    let text = ""
    text += "// clang-format off\n"
    text += `uint8_t txn[${byteTotal}] =\n`
    text += "{\n"
    text += "/* size,upto */\n"
    for (let i = 0; i < tarray.length; i++) {
      const t = tarray[i];
      text += t
    }
    const result = addToMacroDict('EmitDetails', 'STArray', offset)
    macroDict['EmitDetails'] = result
    text += `/* ${emitTotal}, ${offset}  emit details        */ \n`
    offset += emitTotal
    text += `/* 0,   ${offset}                      */ \n`
    text += "};\n"
    text += "// clang-format on\n"
    text += "\n"
    text += "\n"
    text += "// TX BUILDER \n"

    console.log(macroDict);
    
    Object.keys(macroDict).forEach((key) => {
      const value = macroDict[key]
      text += `#define ${value.name} (txn + ${value.offset}U) \n`
    })

    const args: any = {}
    Object.keys(macroDict).forEach((key) => {
      if (!omitList.includes(key)) {
        args[key] = macroDict[key]
      }
    })

    console.log(args);
    
    const br = "\n"
    
    text += br
    text += br
    text += "// clang-format off" + br
    text += "#define PREPARE_TXN(currency_buf, issuer_buf, amount_xfl) do { \\" + br

    // reserve
    text += "    etxn_reserve(1); \\" + br

    // fls
    text += "    uint32_t fls = (uint32_t)ledger_seq() + 1; \\" + br
    text += "    *((uint32_t *)(FLS_OUT)) = FLIP_ENDIAN(fls); \\" + br

    // lls
    text += "    uint32_t lls = fls + 4; \\" + br
    text += "    *((uint32_t *)(LLS_OUT)) = FLIP_ENDIAN(lls); \\" + br

    Object.keys(args).forEach((key: string) => {
      text += parseApiType(args[key].name, key)
    })

    // emit
    text += "    etxn_details(EMIT_OUT, 116U); \\" + br
    // fee
    text += "    int64_t fee = etxn_fee_base(SBUF(txn)); \\" + br
    text += "    uint8_t *b = FEE_OUT; \\" + br
    text += "    *b++ = 0b01000000 + ((fee >> 56) & 0b00111111); \\" + br
    text += "    *b++ = (fee >> 48) & 0xFFU; \\" + br
    text += "    *b++ = (fee >> 40) & 0xFFU; \\" + br
    text += "    *b++ = (fee >> 32) & 0xFFU; \\" + br
    text += "    *b++ = (fee >> 24) & 0xFFU; \\" + br
    text += "    *b++ = (fee >> 16) & 0xFFU; \\" + br
    text += "    *b++ = (fee >> 8) & 0xFFU; \\" + br
    text += "    *b++ = (fee >> 0) & 0xFFU; \\" + br
    text += "    TRACEHEX(txn); \\" + br
    text += "} while(0) \\" + br
    text += "// clang-format on" + br

    text += br
    text += br

    text += "/*" + br
    text += "uint8_t currency_buffer [20];" + br
    text += "uint8_t issuer_buffer [20];" + br
    text += "uint64_t amount_xfl = ??;" + br
    text += "PREPARE_TXN(currency_buf, issuer_buf, amount_xfl);" + br
    text += br
    text += "uint8_t emithash[32];" + br
    text += "int64_t emit_result = emit(SBUF(emithash), SBUF(txn));" + br
    text += "*/" + br

    setHexOutput(text)
  };

  return (
    <div>
      <h1>Xrpl Tx To C Hook</h1>
      <p>Paste a json xrpl tx below to convert it to a c hook binary tx.</p>
      <JsonTextArea onConvert={handleOnConvert} />
      <HookTextArea value={hexOutput} />
    </div>
  );
};

export default HexConversion;
