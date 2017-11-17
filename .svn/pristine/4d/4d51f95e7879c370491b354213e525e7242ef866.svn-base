(function(root) {
    root.wrapMsg = function(err, data) {
        var msg = {};

        if (err != null) {
            msg.code = root.Code.FAILED;
            msg.err  = err;
            msg.msg  = "";
        } else {
            msg.code = root.Code.OK;
            msg.data = data;
        }

        return msg;
    };

    root.Code = {
        OK: 200,
        FAILED: 500,
        TIMEOUT: 1000,

        SYSTEM: {
            MySQL_ERROR:        1001,
            REDIS_ERROR:        1002,
            HTTP_ERROR:         1003,
            CHANNEL_ERROR:      1004,
            RPC_ERROR:          1005,
            SESSION_ERROR:      1006,
            TOKEN_ERROR:        1007
        },

        ROUTE: {
            UNAUTHORIZED:       1101,
            INVALID_PARAMS:     1102,
            INVALID_SESSION:    1103
        },

        // 1200~1299
        GATE: {
            NOT_EXIST_ENTRY:    1201
        },

        // 1300~1399
        AUTH: {
            REJECT_GUEST:       1301
        },

        // 1400~1499
        CONNECTOR: {

        }
    };

    var Error = root.ERROR = {
        INTERNAL_ERROR:                 "1000",
        INVALID_ARGUMENT:               "1001",
        MISSING_ARGUMENT:               "1002",
        ALREADY_EXISTS:                 "1003",
        NOT_EXISTS:                     "1004",
        INVALID_PASSWORD:               "1005",
        UNAUTHORIZED_REQUEST:           "1006",
        INVALID_TOKEN:                  "1007",
        ACCESS_DENIED:                  "1008",
        INVALID_REQUEST:                "1009",
        INVALID_AUTHORIZE_CODE:         "1010",
        REMOTE_SERVER_ERROR:            "1011",
        OBJECT_HAVING_NULL_VALUE:       "1012",
        NOT_EQUAL_PASSWORD:             '1013',
        DB_ERROR:                       '1014',
        USER_ALREADY_EXISTS:            '1015',
        ROLE_NOT_EXISTS:                '1016',
        USER_NOT_EXISTS:                '1017',
        ROLE_ALREADY_EXISTS:            '1018',
        TEAM_NOT_EXISTS:                '1019',
        TEAM_ALREADY_EXISTS:            '1020',
        LEADER_NOT_EXISTS:              '1021',
        LEADER_ALREADY_EXISTS:          '1022',
        TEAM_NAME_DUPLICATE:            '1023',
        TOKENS_NOT_NUMBER:              '1024',
        ACCOUNT_NOT_NUMBER:             '1025',
        NULL_OBJECT:                    '1026',
        ALREADY_FREEZE:                 '1027',
        ALREADY_REMOVE:                 '1028',
        STARTTIME_FORMAT_ERROR:         '1029',
        ENDTIME_FORMAT_ERROR:           '1030',
        MISSING_TITLE:                  '1031',
        MISSING_SUMMARY:                '1032',
        MISSING_CONTENT:                '1033',
        MISSING_STARTTIME:              '1034',
        MISSING_ENDTIME:                '1035',
        MISSING_PRIORITY:               '1036',
        MISSING_TYPE:                   '1037',
        MISSING_NAME:                   '1038',
        MISSING_DESC:                   '1039',
        MISSING_PRICE:                  '1040',
        MISSING_TOKENS:                 '1041',
        MISSING_UPSHELF:                '1042',
        MISSING_OLDPASSWORD:            '1043',
        MISSING_NEWPASSWORD:            '1044',
        MISSING_CONFIRMNEWPASSWORD:     '1045',
        INSUFFICIENT_TOKENS:            '1046',
        LOGINID_NOT_EXISTS:             '1047',
        MISSING_ID:                     '1048',
        MISSING_OPERATE:                '1049',
        MISSING_TABLENAME:              '1050',
        MISSING_STATUS:                 '1051',
        CREATE_FAILED:                  '1052',
        DELETE_FAILED:                  '1053',
        UPDATE_FAILED:                  '1054',
        PRIORITY_VALUE_ERROR:           '1055',
        MISSING_PASSWORD:               '1056',
        MISSING_CONFIRMPASSWORD:        '1057',
        MISSING_ACCOUNT:                '1058',
        ORDERID_NOT_NUMBER:             '1059',
        TOKEN_EXPIRED:                  '1060',
        FIND_FAILED:                    '1061'
    };

    var Message = root.MESSAGE = {
        "1000": [ 500, "InternalError" ],
        "1001": [ 400, "InvalidArgument" ],
        "1002": [ 400, "MissingArgument" ],
        "1003": [ 400, "AlreadyExists" ],
        "1004": [ 400, "NotExists" ],
        "1005": [ 400, "密码错误" ],
        "1006": [ 401, "UnauthorizedRequest" ],
        "1007": [ 401, "InvalidToken" ],
        "1008": [ 400, "AccessDenied" ],
        "1009": [ 400, "InvalidRequest" ],
        "1010": [ 400, "InvalidAuthorizeCode" ],
        "1011": [ 500, "RemoteServerError" ],
        "1012": [ 400, "ObjectHavingNullValue" ],
        "1013": [ 400, "NotEqualPassword" ],
        "1014": [ 400, "数据库错误" ],
        "1015": [ 400, "该用户已存在" ],
        "1016": [ 400, "该角色不存在" ],
        "1017": [ 400, "该用户不存在" ],
        "1018": [ 400, "该角色已存在" ],
        "1019": [ 400, "小组不存在" ],
        "1020": [ 400, "小组已存在" ],
        "1021": [ 400, "该组组长不存在" ],
        "1022": [ 400, "该组组长已存在" ],
        "1023": [ 400, "小组名重复" ],
        "1024": [ 400, "TokensNotNumber" ],
        "1025": [ 400, "AccountNotNumber" ],
        "1026": [ 400, "NullObject" ],
        "1027": [ 400, "AlreadyFreeze" ],
        "1028": [ 400, "AlreadyRemove" ],
        "1029": [ 400, "StartTimeFormatError" ],
        "1030": [ 400, "EndTimeFormatError" ],
        "1031": [ 400, "MissingTitle" ],
        "1032": [ 400, "MissingSummary" ],
        "1033": [ 400, "MissingContent" ],
        "1034": [ 400, "MissingStarttime" ],
        "1035": [ 400, "MissingEndtime" ],
        "1036": [ 400, "MissingPriority" ],
        "1037": [ 400, "MissingType" ],
        "1038": [ 400, "MissingName" ],
        "1039": [ 400, "MissingDESC" ],
        "1040": [ 400, "MissingPrice" ],
        "1041": [ 400, "MissingTokens" ],
        "1042": [ 400, "MissingUpShelf" ],
        "1043": [ 400, "MissingOldPassword" ],
        "1044": [ 400, "MissingNewPassword" ],
        "1045": [ 400, "MissingConfirmPassword" ],
        "1046": [ 400, "InsufficientTokens" ],
        "1047": [ 400, "LoginIdNotExists" ],
        "1048": [ 400, "MissingId" ],
        "1049": [ 400, "MissingOperate" ],
        "1050": [ 400, "MissingTableName" ],
        "1051": [ 400, "MissingStatus" ],
        "1052": [ 400, "CreateFailed" ],
        "1053": [ 400, "DeleteFailed" ],
        "1054": [ 400, "UpdateFailed" ],
        "1055": [ 400, "PriorityValueError" ],
        "1056": [ 400, "MissingPassword" ],
        "1057": [ 400, "MissingConfirmPassword" ],
        "1058": [ 400, "MissingAccount" ],
        "1060": [ 400, "TokenExpired" ],
        "1061": [ 400, "FindFailed" ]
    };

    var ProductState = root.PRODUCT_STATE = {
        0: "停售",
        1: "未开售",
        2: "推广期",
        3: "在售期",
        4: "清仓期",
        5: "归档",
        6: "备用"
    };
}(Smartdo));