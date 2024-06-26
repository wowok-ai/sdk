
export enum Errors {
    IsValidDesription = 'invalid description',
    IsValidName = 'invalid name',
    IsValidName_AllowEmpty = 'invalid name',
    IsValidEndpoint = 'invalid endpoint',
    IsValidAddress = 'invalid address',
    IsValidArgType = 'invalid argument type',
    IsValidTokenType = 'invalid token type',
    IsValidUint = 'invalid uint',
    IsValidInt = 'invalid int', 
    IsValidPercent = 'invalid percent',
    IsValidArray = 'invalid array',
    IsValidObjects = 'invalid objects',
    AllInvalid = 'one valid at least',
    InvalidParam  = 'invalid parameter',
    IsValidPermissionIndex = 'invalid permission index',
    IsValidKey = 'invalid key',
    Fail = 'fail',
    IsValidIndentifier = 'indentifier invalid',
    isValidHttpUrl = 'invalid url',
    IsValidUserDefinedIndex = 'invalid user defined permission index',
    bcsTypeInvalid = 'invalid bcs type',
}

export const ERROR = (error:Errors, info?:any) =>  {
    const e = error + info ? (': ' + info) : '';
    throw e;
}